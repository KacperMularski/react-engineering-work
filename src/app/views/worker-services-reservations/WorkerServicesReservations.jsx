import React, { useState, useEffect } from 'react';
import {
  styled,
  Box,
  Stack,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  IconButton,
  Icon,
  TablePagination,
  CircularProgress,
  Slide,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Dialog,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import {
  addDoc,
  collection,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from 'firebase';
import Typography from '@mui/material/Typography';
import { SimpleCard, Breadcrumb } from 'app/components';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}));

const DialogTitleRoot = styled(MuiDialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  '& .closeButton': {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const DialogTitle = (props) => {
  const { children, onClose } = props;
  return (
    <DialogTitleRoot>
      {children}
      {onClose ? (
        <IconButton aria-label="Close" className="closeButton" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitleRoot>
  );
};

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  '&.root': { padding: theme.spacing(2) },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function WorkerServicesReservations() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 599);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 599);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  //Filtrowanie wyników
  const [status, setStatus] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [dateSort, setDateSort] = useState('desc');
  const [isActive, setIsActive] = useState('');
  //Paginacja
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});
  //Okna dialogowe i loading
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogConf, setOpenDialogConf] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  //Wybrana rezerwacja
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  //Edycja rezerwacji
  const [editReservationStatus, setEditReservationStatus] = useState('');
  const [clientReservationNote, setClientReservationNote] = useState('');

  const handleOpenDialogConf = (selectedReservation) => {
    setSelectedReservation(selectedReservation);
    setOpenDialog(false);
    setOpenDialogConf(true);
  };

  const handleCloseDialogConf = () => {
    setOpenDialogConf(false);
    setOpenDialog(true);
  };

  const handleChangeStatus = (event) => {
    setStatus(event.target.value);
  };

  const handleChangeDateSort = (event) => {
    setDateSort(event.target.value);
  };

  const handleChangeIsActive = (event) => {
    setIsActive(event.target.value);
  };

  const handleChangeServiceType = (event) => {
    setServiceType(event.target.value);
  };

  const handleDeleteReservation = async () => {
    const servicesReservationsRefDisable = doc(db, 'services-reservations', selectedReservation.id);
    const reservationsDatesDocRef = collection(db, 'reservations-dates');

    const startOfDay = new Date(selectedReservation.data.date.toDate());
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedReservation.data.date.toDate());
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      reservationsDatesDocRef,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );

    try {
      await deleteDoc(servicesReservationsRefDisable);
      const querySnapshot = await getDocs(q);
      const reservationDates = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const reservationsDatesUpdateDocRef = doc(reservationsDatesDocRef, reservationDates[0].id);
      const timeKey = `${selectedReservation.data.time}-reserved`;
      await updateDoc(reservationsDatesUpdateDocRef, {
        [timeKey]: false,
        available: true,
      });
    } catch (error) {
      setOpenErrorSnackbar(true);
    }
    setOpenDialogConf(false);
    setOpenSuccessSnackbar(true);
    startLoading();
    fetchTotalCount();
    fetchData();
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    setReservations([]);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setPageDocs({});
  };

  const handleOpenDialog = (reservation) => {
    setSelectedReservation(reservation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const handleEditReservationStatus = (event) => {
    setEditReservationStatus(event.target.value);
  };

  const handleClientReservationNote = (event) => {
    setClientReservationNote(event.target.value);
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (editReservationStatus === '' || editReservationStatus === selectedReservation.data.status) {
      return;
    }
    setLoadingSubmit(true);
    await sleep(2000);
    const servicesReservationsEditRef = doc(db, 'services-reservations', selectedReservation.id);
    const notificationsRef = collection(db, 'notifications');
    const statusNotificationType = 'Zmiana statusu rezerwacji';
    const notificationContent =
      'Status twojej rezerwacji na ' +
      selectedReservation.data.serviceType +
      ' został zmieniony z ' +
      selectedReservation.data.status +
      ' na ' +
      editReservationStatus +
      '. ' +
      clientReservationNote;
    let currentDate = new Date();
    try {
      if (editReservationStatus === 'Anulowano' || editReservationStatus === 'Ukończono') {
        await updateDoc(servicesReservationsEditRef, {
          status: editReservationStatus,
          isActive: false,
        });
      } else {
        await updateDoc(servicesReservationsEditRef, {
          status: editReservationStatus,
        });
      }

      await addDoc(notificationsRef, {
        uid: selectedReservation.data.uid,
        type: statusNotificationType,
        content: notificationContent,
        dateTime: currentDate,
      });

      setOpenSuccessSnackbar(true);
    } catch (error) {
      setErrorSnackbarMessage('Błąd serwera: ', error);
      setOpenErrorSnackbar(true);
    }
    setLoadingSubmit(false);
    startLoading(true);
    fetchData();
  };

  function createQueryConditions(status, serviceType, isActive) {
    let conditions = [];

    if (status !== '' && status !== 'all') {
      conditions.push(where('status', '==', status));
    }

    if (serviceType !== '' && serviceType !== 'all') {
      conditions.push(where('serviceType', '==', serviceType));
    }

    if (isActive !== '' && isActive !== 'all') {
      conditions.push(where('isActive', '==', isActive));
    }

    return conditions;
  }

  const fetchTotalCount = async () => {
    try {
      const servicesReservationsRef = collection(db, 'services-reservations');
      const conditions = createQueryConditions(status, serviceType, isActive);
      const q = query(servicesReservationsRef, ...conditions);

      const querySnapshot = await getDocs(q);
      setTotalCount(querySnapshot.size);
    } catch (error) {
      console.error('Błąd wczytywania liczby wyników: ', error);
    }
  };

  const fetchData = async () => {
    const servicesReservationsRef = collection(db, 'services-reservations');
    const conditions = createQueryConditions(status, serviceType, isActive);

    try {
      let q;
      if (page === 0) {
        q = query(
          servicesReservationsRef,
          ...conditions,
          orderBy('date', dateSort),
          limit(rowsPerPage)
        );
      } else {
        const startAtDoc = pageDocs[page] || null;
        q = query(
          servicesReservationsRef,
          ...conditions,
          orderBy('date', dateSort),
          startAfter(startAtDoc),
          limit(rowsPerPage)
        );
      }

      const querySnapshot = await getDocs(q);
      const newReservations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setReservations(newReservations);

      if (querySnapshot.docs.length > 0) {
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setPageDocs((prev) => ({ ...prev, [page + 1]: lastDoc }));
      }
    } catch (error) {
      console.log('Błąd: ', error);
    }
  };

  const startLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    startLoading();
    fetchTotalCount();
    fetchData();
    return () => {
      setLoading(false);
      setTimeout(0);
    };
  }, [page, rowsPerPage, status, isActive, serviceType, dateSort]);

  return (
    <>
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: 'Wszystkie rezerwacje usług' }]} />
        </Box>
        <Stack spacing={1} sx={{ margin: 1 }}>
          <SimpleCard title="Filtrowanie wyników">
            <Accordion sx={{ border: 0, boxShadow: 'none' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="form-content"
                id="form-header"
              >
                <Typography>Kliknij, aby rozwinąć formularz filtrowania</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack>
                  <Grid container spacing={2}>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-1">Status rezerwacji</InputLabel>
                        <Select
                          labelId="select-label-1"
                          id="select-label-1"
                          name={status}
                          label="Status rezerwacji"
                          onChange={handleChangeStatus}
                          defaultValue={'all'}
                        >
                          <MenuItem value={'all'}>Wszystko</MenuItem>
                          <MenuItem value={'Weryfikacja'}>Weryfikacja</MenuItem>
                          <MenuItem value={'Ukończono'}>Ukończono</MenuItem>
                          <MenuItem value={'Zatwierdzono'}>Zatwierdzono</MenuItem>
                          <MenuItem value={'Anulowano'}>Anulowano</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-2">Rodzaj rezerwacji</InputLabel>
                        <Select
                          labelId="select-label-2"
                          id="select-label-2"
                          name={serviceType}
                          label="Rodzaj rezerwacji"
                          onChange={handleChangeServiceType}
                          defaultValue={'all'}
                        >
                          <MenuItem value={'all'}>Wszystko</MenuItem>
                          <MenuItem value={'Przegląd i badanie stanu technicznego pojazdu'}>
                            Przegląd i badanie stanu technicznego pojazdu
                          </MenuItem>
                          <MenuItem value={'Serwis olejowy i wymiana filtrów'}>
                            Serwis olejowy i wymiana filtrów
                          </MenuItem>
                          <MenuItem value={'Serwis klimatyzacji'}>Serwis klimatyzacji</MenuItem>
                          <MenuItem value={'Naprawy blacharsko-lakiernicze'}>
                            Naprawy blacharsko-lakiernicze
                          </MenuItem>
                          <MenuItem value={'Wymiana zużytych lub niesprawnych częsci'}>
                            Wymiana zużytych lub niesprawnych częsci
                          </MenuItem>
                          <MenuItem value={'Wymiana opon'}>Wymiana opon</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-3">Sortowanie po dacie</InputLabel>
                        <Select
                          labelId="select-label-3"
                          id="select-label-3"
                          name={dateSort}
                          label="Sortowanie po dacie"
                          onChange={handleChangeDateSort}
                          defaultValue={'desc'}
                        >
                          <MenuItem value={'desc'}>Od najnowszych</MenuItem>
                          <MenuItem value={'asc'}>Od najstarszych</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-4">Rezerwacje aktywne/nieaktywne</InputLabel>
                        <Select
                          labelId="select-label-4"
                          id="select-label-4"
                          name={isActive}
                          label="Rezerwacje aktywne/nieaktywne"
                          onChange={handleChangeIsActive}
                          defaultValue={true}
                        >
                          <MenuItem value={'all'}>Wszystkie</MenuItem>
                          <MenuItem value={true}>Aktywne</MenuItem>
                          <MenuItem value={false}>Nieaktywne</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </SimpleCard>
        </Stack>

        <Stack spacing={1} sx={{ margin: 1 }}>
          <Grid>
            <SimpleCard title="Rezerwacje">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box overflow="auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">
                          {isMobile ? 'Rd.rez.' : 'Rodzaj rezerwacji'}
                        </TableCell>
                        <TableCell align="center">Termin</TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          Imie
                        </TableCell>
                        <TableCell align="center">Nazwisko</TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          Status
                        </TableCell>
                        <TableCell align="center">Edytuj</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservations &&
                        reservations.map((reservation, index) => (
                          <TableRow key={index}>
                            <TableCell align="left">{reservation.data.serviceType}</TableCell>
                            <TableCell align="center">
                              {reservation.data.date
                                ? reservation.data.date.toDate().toLocaleDateString()
                                : '-'}{' '}
                              {reservation.data.time}:00
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ display: { xs: 'none', md: 'table-cell' } }}
                            >
                              {reservation.data.name}
                            </TableCell>
                            <TableCell align="center">{reservation.data.surname}</TableCell>
                            <TableCell
                              align="center"
                              sx={{ display: { xs: 'none', md: 'table-cell' } }}
                            >
                              {reservation.data.status === 'Weryfikacja' ? (
                                <Alert variant="filled" severity="info">
                                  {reservation.data.status}
                                </Alert>
                              ) : reservation.data.status === 'Anulowano' ? (
                                <Alert variant="filled" severity="error">
                                  {reservation.data.status}
                                </Alert>
                              ) : reservation.data.status === 'Zatwierdzono' ? (
                                <Alert variant="filled" severity="warning">
                                  {reservation.data.status}
                                </Alert>
                              ) : (
                                <Alert variant="filled" severity="success">
                                  {reservation.data.status}
                                </Alert>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton onClick={() => handleOpenDialog(reservation)}>
                                <Icon color="info">edit</Icon>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>

                  <TablePagination
                    sx={{ px: 2 }}
                    page={page}
                    component="div"
                    rowsPerPage={rowsPerPage}
                    count={totalCount}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[4, 6, 8]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    nextIconButtonProps={{ 'aria-label': 'Next Page' }}
                    backIconButtonProps={{ 'aria-label': 'Previous Page' }}
                  />
                </Box>
              )}
            </SimpleCard>
          </Grid>
        </Stack>
      </Container>

      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="customized-dialog-title"
        open={openDialog}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleCloseDialog}>
          Edycja rezerwacji
        </DialogTitle>

        <DialogContent>
          {selectedReservation && (
            <>
              <Stack spacing={1} sx={{ margin: 1 }}>
                <SimpleCard title="Szczegóły rezerwacji">
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      Nazwa usługi:
                    </Grid>
                    <Grid item xs={8}>
                      <b> {selectedReservation.data.serviceType} </b>
                    </Grid>
                    <Grid item xs={4}>
                      Wybrany termin:
                    </Grid>
                    <Grid item xs={8}>
                      <b>
                        {' '}
                        {selectedReservation.data.date
                          ? selectedReservation.data.date.toDate().toLocaleDateString()
                          : '-'}{' '}
                        {selectedReservation.data.time}:00{' '}
                      </b>
                    </Grid>
                    <Grid item xs={4}>
                      Imię:
                    </Grid>
                    <Grid item xs={8}>
                      <b>{selectedReservation.data.name}</b>
                    </Grid>
                    <Grid item xs={4}>
                      Nazwisko:
                    </Grid>
                    <Grid item xs={8}>
                      <b>{selectedReservation.data.surname}</b>
                    </Grid>
                    <Grid item xs={4}>
                      VIN:
                    </Grid>
                    <Grid item xs={8}>
                      <b>{selectedReservation.data.vinNumber}</b>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenDialogConf(selectedReservation)}
                      >
                        Usuń rezerwację
                      </Button>
                    </Grid>
                  </Grid>
                </SimpleCard>
                <SimpleCard title="Zmiana statusu">
                  <form onSubmit={handleSubmitEdit}>
                    <Grid container spacing={3}>
                      <Grid item xs={4}>
                        Status:
                      </Grid>
                      <Grid item xs={8}>
                        <FormControl>
                          <InputLabel id="select-label-1">Status rezerwacji</InputLabel>
                          <Select
                            labelId="select-label-1"
                            id="select-label-1"
                            name={editReservationStatus}
                            label="Status rezerwacji"
                            onChange={handleEditReservationStatus}
                            defaultValue={selectedReservation.data.status}
                          >
                            <MenuItem value={'Weryfikacja'}>Weryfikacja</MenuItem>
                            <MenuItem value={'Ukończono'}>Ukończono</MenuItem>
                            <MenuItem value={'Zatwierdzono'}>Zatwierdzono</MenuItem>
                            <MenuItem value={'Anulowano'}>Anulowano</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        Dodaj notatkę dla klienta:
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          multiline
                          minRows={3}
                          placeholder="Wpisz tekst..."
                          variant="outlined"
                          onChange={handleClientReservationNote}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <LoadingButton
                          type="submit"
                          color="primary"
                          variant="contained"
                          loading={loadingSubmit}
                          sx={{ mb: 2, mt: 1 }}
                        >
                          Zmień status
                        </LoadingButton>
                      </Grid>
                    </Grid>
                  </form>
                </SimpleCard>
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDialogConf}
        keepMounted
        onClose={handleCloseDialogConf}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          Czy na pewno chcesz usunąć rezerwację?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Tej operacji nie można cofnąć!
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialogConf} color="primary">
            Anuluj
          </Button>

          <Button onClick={handleDeleteReservation} color="primary">
            Zatwierdź
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSuccessSnackbar}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{ width: '100%' }}
          variant="filled"
        >
          Operacja zakończona pomyślnie!
        </Alert>
      </Snackbar>
      <Snackbar open={openErrorSnackbar} autoHideDuration={4000} onClose={handleCloseErrorSnackbar}>
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          sx={{ width: '100%' }}
          variant="filled"
        >
          {errorSnackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default WorkerServicesReservations;
