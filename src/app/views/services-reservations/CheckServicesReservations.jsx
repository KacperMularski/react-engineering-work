import React, { useState, useEffect } from 'react';
import { SimpleCard, Breadcrumb } from 'app/components';
import useAuth from 'app/hooks/useAuth';
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
} from '@mui/material';
import {
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
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';

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

function CheckServicesReservations() {
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
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});

  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [openDialogConf, setOpenDialogConf] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const [reservationsType, setReservationsType] = useState('all');
  const [isActive, setIsActive] = useState(true);

  const reservationsTypeHandler = (event) => {
    setReservationsType(event.target.value);
  };

  const reservationsIsActiveHandler = (event) => {
    setIsActive(event.target.value);
  };

  const startLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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

  const handleOpenDialogConf = (reservation) => {
    setSelectedReservation(reservation);
    setOpenDialogConf(true);
  };

  const handleCloseDialogConf = () => {
    setOpenDialogConf(false);
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
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
        id: doc.id, //  ID dokumentu
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
    setPage(0);
    fetchTotalCount();
    fetchData();
  };

  function createQueryConditions(reservationsType) {
    const uid = user.uid;
    let conditions = [];

    if (reservationsType !== 'all') {
      conditions.push(where('serviceType', '==', reservationsType));
    }
    if (isActive !== 'all') {
      conditions.push(where('isActive', '==', isActive));
    }
    conditions.push(where('uid', '==', uid));

    return conditions;
  }

  const fetchTotalCount = async () => {
    try {
      const servicesReservationsRef = collection(db, 'services-reservations');
      const conditions = createQueryConditions(reservationsType);
      const q = query(servicesReservationsRef, ...conditions);

      const querySnapshot = await getDocs(q);
      setTotalCount(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  const fetchData = async () => {
    const servicesReservationsRef = collection(db, 'services-reservations');
    const conditions = createQueryConditions(reservationsType);

    try {
      let q;
      if (page === 0) {
        q = query(
          servicesReservationsRef,
          ...conditions,
          orderBy('date', 'desc'),
          limit(rowsPerPage)
        );
      } else {
        const startAtDoc = pageDocs[page] || null;
        q = query(
          servicesReservationsRef,
          ...conditions,
          orderBy('date', 'desc'),
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
      setOpenErrorSnackbar(true);
      console.log(error);
    }
  };

  useEffect(() => {
    startLoading();
    fetchTotalCount();
    fetchData();
  }, [page, rowsPerPage, reservationsType, isActive]);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Rezerwacje usług', path: '/checkServicesReservations' },
            { name: 'Sprawdź swoje rezerwacje' },
          ]}
        />
      </Box>

      <SimpleCard title="Rezerwacje">
        <Stack spacing={2} sx={{ margin: 2 }}>
          <Grid>
            <FormControl fullWidth>
              <InputLabel id="select-label-1">Rodzaj rezerwacji</InputLabel>
              <Select
                labelId="select-label-1"
                id="select-label-1"
                value={reservationsType}
                label="Rodzaj rezerwacji"
                onChange={reservationsTypeHandler}
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
          <Grid>
            <FormControl fullWidth>
              <InputLabel id="select-label-2">Rezerwacje aktywne/nieaktywne</InputLabel>
              <Select
                labelId="select-label-2"
                id="select-label-2"
                value={isActive}
                label="Rezerwacje aktywne/nieaktywne"
                onChange={reservationsIsActiveHandler}
                defaultValue={true}
              >
                <MenuItem value={'all'}>Wszystkie</MenuItem>
                <MenuItem value={true}>Aktywne</MenuItem>
                <MenuItem value={false}>Nieaktywne</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Stack>
      </SimpleCard>

      <Stack spacing={2} sx={{ marginTop: 1 }}>
        <SimpleCard>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Box overflow="auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">{isMobile ? 'Rd.rez.' : 'Rodzaj rezerwacji'}</TableCell>
                    <TableCell align="center">Termin</TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      Imie
                    </TableCell>
                    <TableCell align="center">Nazwisko</TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      Status
                    </TableCell>
                    <TableCell align="center">Anuluj</TableCell>
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
                          <IconButton onClick={() => handleOpenDialogConf(reservation)}>
                            <Icon color="error">close</Icon>
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
                rowsPerPageOptions={[2, 3, 4]}
                onRowsPerPageChange={handleChangeRowsPerPage}
                nextIconButtonProps={{ 'aria-label': 'Next Page' }}
                backIconButtonProps={{ 'aria-label': 'Previous Page' }}
              />
            </Box>
          )}
        </SimpleCard>
      </Stack>
      <Dialog
        open={openDialogConf}
        keepMounted
        onClose={handleCloseDialogConf}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          Czy na pewno chcesz anulować rezerwację?
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
          Zlecenie zostało anulowane pomyślnie
        </Alert>
      </Snackbar>
      <Snackbar open={openErrorSnackbar} autoHideDuration={4000} onClose={handleCloseErrorSnackbar}>
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          sx={{ width: '100%' }}
          variant="filled"
        >
          Błąd bazy danych. Spróbuj ponownie później
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CheckServicesReservations;
