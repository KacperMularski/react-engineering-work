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
  Checkbox,
  FormControlLabel,
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
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
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

const StyledTable = styled(Table)(() => ({
  whiteSpace: 'pre',
  '& thead': {
    '& tr': { '& th': { paddingLeft: 0, paddingRight: 0 } },
  },
  '& tbody': {
    '& tr': { '& td': { paddingLeft: 0, textTransform: 'capitalize' } },
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
    <DialogTitleRoot disableTypography>
      <Typography variant="h6">{children}</Typography>
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

function WorkerRepairOrders() {
  const [status, setStatus] = useState('');
  const [surname, setSurname] = useState('');
  const [faultType, setFaultType] = useState('');
  //Paginacja
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});
  //Alerty, dialogi i ładowanie
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editOrderStatus, setEditOrderStatus] = useState('');
  const [clientOrderNote, setClientOrderNote] = useState('');

  const handleChangeStatus = (event) => {
    setStatus(event.target.value);
  };

  const handleChangeSurname = (event) => {
    setSurname(event.target.value);
  };

  const handleChangeFaultType = (event) => {
    setFaultType(event.target.value);
  };

  const startLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    startLoading();
  }, []);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    setOrders([]);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setPageDocs({});
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
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

  const handleEditOrderStatus = (event) => {
    setEditOrderStatus(event.target.value);
  };

  const handleClientOrderNote = (event) => {
    setClientOrderNote(event.target.value);
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (editOrderStatus === '' || editOrderStatus === selectedOrder.data.status) {
      return;
    }
    setLoadingSubmit(true);
    await sleep(2000);
    const repairOrderEditRef = doc(db, 'repair-orders', selectedOrder.id);
    const notificationsRef = collection(db, 'notifications');
    const statusNotificationType = 'Zmiana statusu';
    const notificationContent =
      'Status twojej rezerwacji został zmieniony z ' +
      selectedOrder.data.status +
      ' na ' +
      editOrderStatus +
      '. ' +
      clientOrderNote;
    let currentDate = new Date();
    try {
      if (editOrderStatus === 'Anulowano' || editOrderStatus === 'Ukończono') {
        await updateDoc(repairOrderEditRef, {
          status: editOrderStatus,
          isActive: false,
        });
      } else {
        await updateDoc(repairOrderEditRef, {
          status: editOrderStatus,
        });
      }

      await addDoc(notificationsRef, {
        uid: selectedOrder.data.uid,
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

  function createQueryConditions(status, surname, faultType) {
    let conditions = [];
    if (surname !== '') {
      const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
      const formattedSurname = capitalizeFirstLetter(surname);
      const endSurname =
        formattedSurname.slice(0, -1) +
        String.fromCharCode(formattedSurname.charCodeAt(formattedSurname.length - 1) + 1);

      conditions.push(where('surname', '>=', formattedSurname), where('surname', '<', endSurname));
    }

    if (status !== '' && status !== 'all') {
      conditions.push(where('status', '==', status));
    }

    if (faultType !== '' && faultType !== 'all') {
      conditions.push(where('faultType', '==', faultType));
    }

    return conditions;
  }

  const fetchTotalCount = async () => {
    try {
      const repairOrdersRef = collection(db, 'repair-orders');
      const conditions = createQueryConditions(status, surname, faultType);
      const q = query(repairOrdersRef, ...conditions);

      const querySnapshot = await getDocs(q);
      setTotalCount(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  const fetchData = async () => {
    const repairOrdersRef = collection(db, 'repair-orders');
    const conditions = createQueryConditions(status, surname, faultType);

    try {
      let q;
      if (page === 0) {
        q = query(
          repairOrdersRef,
          ...conditions,
          orderBy('surname'),
          orderBy('dateTime', 'desc'),
          limit(rowsPerPage)
        );
      } else {
        const startAtDoc = pageDocs[page] || null; // Adjust to use the current page
        q = query(
          repairOrdersRef,
          ...conditions,
          orderBy('surname'),
          orderBy('dateTime', 'desc'),
          startAfter(startAtDoc),
          limit(rowsPerPage)
        );
      }

      const querySnapshot = await getDocs(q);
      const newOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setOrders(newOrders);

      if (querySnapshot.docs.length > 0) {
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setPageDocs((prev) => ({ ...prev, [page + 1]: lastDoc })); // Store the last document of the current page for the next page
      }
    } catch (error) {
      console.log('Błąd:', error);
    }
  };

  useEffect(() => {
    startLoading();
    fetchTotalCount();
    fetchData();
  }, [page, rowsPerPage, status, surname, faultType]);

  return (
    <>
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: 'Wszystkie zlecenia' }]} />
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
                        <InputLabel id="select-label-1">Status zleceń</InputLabel>
                        <Select
                          labelId="select-label-1"
                          id="select-label-1"
                          name={status}
                          label="Status zleceń"
                          onChange={handleChangeStatus}
                          defaultValue={'all'}
                        >
                          <MenuItem value={'all'}>Wszystko</MenuItem>
                          <MenuItem value={'Weryfikacja'}>Weryfikacja</MenuItem>
                          <MenuItem value={'Ukończono'}>Ukończono</MenuItem>
                          <MenuItem value={'Naprawa'}>Naprawa</MenuItem>
                          <MenuItem value={'Anulowano'}>Anulowano</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-2">Rodzaj usterki</InputLabel>
                        <Select
                          labelId="select-label-2"
                          id="select-label-2"
                          name={faultType}
                          label="Rodzaj usterki"
                          onChange={handleChangeFaultType}
                          defaultValue={'all'}
                        >
                          <MenuItem value={'all'}>Wszystko</MenuItem>
                          <MenuItem value={'Silnik'}>Silnik</MenuItem>
                          <MenuItem value={'Układ hamulcowy'}>Układ hamulcowy</MenuItem>
                          <MenuItem value={'Klimatyzacja'}>Klimatyzacja</MenuItem>
                          <MenuItem value={'Zawieszenie'}>Zawieszenie</MenuItem>
                          <MenuItem value={'Układ kierowniczy'}>Układ kierowniczy</MenuItem>
                          <MenuItem value={'Instalacja elektryczna'}>
                            Instalacja elektryczna
                          </MenuItem>
                          <MenuItem value={'Inna'}>Inna</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <TextField
                          id="outlined-basic"
                          label="Nazwisko klienta"
                          variant="outlined"
                          onChange={handleChangeSurname}
                        />
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
            <SimpleCard title="Zlecenia">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box overflow="auto">
                  <StyledTable>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Rodzaj usterki</TableCell>
                        <TableCell align="center">Marka</TableCell>
                        <TableCell align="center">Model</TableCell>
                        <TableCell align="center">Nazwisko</TableCell>
                        <TableCell align="center">Data</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Edytuj</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders &&
                        orders.map((order, index) => (
                          <TableRow key={index}>
                            <TableCell align="left">{order.data.faultType}</TableCell>
                            <TableCell align="center">{order.data.carBrand}</TableCell>
                            <TableCell align="center">{order.data.carModel}</TableCell>
                            <TableCell align="center">{order.data.surname}</TableCell>
                            <TableCell align="center">
                              {order.data.dateTime
                                ? order.data.dateTime.toDate().toLocaleString()
                                : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {order.data.status === 'Weryfikacja' ? (
                                <Alert variant="filled" severity="info">
                                  {order.data.status}
                                </Alert>
                              ) : order.data.status === 'Anulowano' ? (
                                <Alert variant="filled" severity="error">
                                  {order.data.status}
                                </Alert>
                              ) : order.data.status === 'Naprawa' ? (
                                <Alert variant="filled" severity="warning">
                                  {order.data.status}
                                </Alert>
                              ) : (
                                <Alert variant="filled" severity="success">
                                  {order.data.status}
                                </Alert>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton onClick={() => handleOpenDialog(order)}>
                                <Icon color="info">edit</Icon>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </StyledTable>

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
          Edycja zlecenia
        </DialogTitle>

        <DialogContent>
          {selectedOrder && (
            <>
              <Stack spacing={1} sx={{ margin: 1 }}>
                <SimpleCard title="Szczegóły zlecenia">
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      Rodzaj usterki:
                    </Grid>
                    <Grid item xs={8}>
                      <b> {selectedOrder.data.faultType} </b>
                    </Grid>

                    <Grid item xs={4}>
                      Marka pojazdu:
                    </Grid>
                    <Grid item xs={8}>
                      <b> {selectedOrder.data.carBrand} </b>
                    </Grid>

                    <Grid item xs={4}>
                      Model pojazdu:
                    </Grid>
                    <Grid item xs={8}>
                      <b>{selectedOrder.data.carModel}</b>
                    </Grid>

                    <Grid item xs={4}>
                      Data zlecenia:
                    </Grid>
                    <Grid item xs={8}>
                      <b>
                        {' '}
                        {selectedOrder.data.dateTime
                          ? selectedOrder.data.dateTime.toDate().toLocaleString()
                          : '-'}{' '}
                      </b>
                    </Grid>

                    <Grid item xs={4}>
                      Imię:
                    </Grid>
                    <Grid item xs={8}>
                      <b>{selectedOrder.data.name}</b>
                    </Grid>

                    <Grid item xs={4}>
                      Nazwisko:
                    </Grid>
                    <Grid item xs={8}>
                      <b>{selectedOrder.data.surname}</b>
                    </Grid>
                    <Grid item xs={4}>
                      Opis:
                    </Grid>
                    <Grid item xs={8}>
                      <b>
                        {selectedOrder.data.description !== ''
                          ? selectedOrder.data.description
                          : 'Brak'}
                      </b>
                    </Grid>
                  </Grid>
                </SimpleCard>
                <SimpleCard title="Możliwe przyczyny usterki">
                  <Grid container spacing={3}>
                    {Array.isArray(selectedOrder.data.computedIssues) ? (
                      selectedOrder.data.computedIssues.map((item, index) => (
                        <Grid item xs={12}>
                          {index + 1} : <b>{item}</b>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        {selectedOrder.data.computedIssues}
                      </Grid>
                    )}
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
                          <InputLabel id="select-label-1">Status zlecenia</InputLabel>
                          <Select
                            labelId="select-label-1"
                            id="select-label-1"
                            name={editOrderStatus}
                            label="Status zlecenia"
                            onChange={handleEditOrderStatus}
                            defaultValue={selectedOrder.data.status}
                          >
                            <MenuItem value={'Weryfikacja'}>Weryfikacja</MenuItem>
                            <MenuItem value={'Ukończono'}>Ukończono</MenuItem>
                            <MenuItem value={'Naprawa'}>Naprawa</MenuItem>
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
                          onChange={handleClientOrderNote}
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

export default WorkerRepairOrders;
