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
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
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

function CheckServicesReservations() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});

  const [reservationsType, setReservationsType] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [openDialogConf, setOpenDialogConf] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const reservationsTypeHandler = (event) => {
    setReservationsType(event.target.value);

    startLoading();
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
    setReservations([]);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setPageDocs({});
  };

  const handleDeleteReservation = async () => {
    const servicesReservationsRefDisable = doc(db, 'services-reservations', selectedReservation.id);
    try {
      await deleteDoc(servicesReservationsRefDisable);
    } catch (error) {
      setOpenErrorSnackbar(true);
    }
    setOpenDialogConf(false);
    setOpenSuccessSnackbar(true);
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

  function createQueryConditions(reservationsType) {
    const uid = user.uid;
    let conditions = [];

    if (reservationsType !== 'all') {
      conditions.push(
        where('isActive', '==', true),
        where('serviceType', '==', reservationsType),
        where('uid', '==', uid)
      );
    } else {
      conditions.push(where('isActive', '==', true), where('uid', '==', uid));
    }
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
        q = query(servicesReservationsRef, ...conditions, orderBy('date'), limit(rowsPerPage));
      } else {
        const startAtDoc = pageDocs[page] || null;
        q = query(
          servicesReservationsRef,
          ...conditions,
          orderBy('date'),
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
        setPageDocs((prev) => ({ ...prev, [page + 1]: lastDoc })); // Store the last document of the current page for the next page
      }
    } catch (error) {
      setOpenErrorSnackbar(true);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTotalCount();
    fetchData();
  }, [page, rowsPerPage, reservationsType]);

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
      <Stack spacing={2} sx={{ margin: 2 }}>
        <SimpleCard title="Rezerwacje">
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
        </SimpleCard>
      </Stack>
      <Stack spacing={2} sx={{ margin: 2 }}>
        <SimpleCard>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Rodzaj rezerwacji</TableCell>
                    <TableCell align="center">Wybrana data</TableCell>
                    <TableCell align="center">Imie</TableCell>
                    <TableCell align="center">Nazwisko</TableCell>
                    <TableCell align="center">Status</TableCell>
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
                            : '-'}
                        </TableCell>
                        <TableCell align="center">{reservation.data.name}</TableCell>
                        <TableCell align="center">{reservation.data.surname}</TableCell>
                        <TableCell align="center">
                          {reservation.data.status === 'Oczekiwanie' ? (
                            <Alert variant="filled" severity="info">
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
              </StyledTable>

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
