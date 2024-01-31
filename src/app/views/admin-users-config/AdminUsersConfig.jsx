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
import SendIcon from '@mui/icons-material/Send';
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
import { NavLink, useNavigate } from 'react-router-dom';
import { SimpleCard, Breadcrumb } from 'app/components';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';

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

function AdminUsersConfig() {
  const navigate = useNavigate();
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
  const [surnameSearch, setSurnameSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [isBlockedSearch, setIsBlockedSearch] = useState(false);

  //Paginacja
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});
  //Alerty, dialogi i ładowanie
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogConf, setOpenDialogConf] = useState(false);
  const [openNotificationSendDialog, setOpenNotificationSendDialog] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  //powiadomienia
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationText, setNotificationText] = useState('');

  //Sprawdzenie, czy nastąpiły jakieś zmiany
  const isAnyUserChanged = users.some((user) => user.changed);

  const handleChangeSurnameSearch = (event) => {
    setSurnameSearch(event.target.value);
  };

  const handleChangeRoleSearch = (event) => {
    setRoleSearch(event.target.value);
  };

  const handleEditRole = (id, event) => {
    const newRole = event.target.value;
    setEditRole(newRole);
    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          data: { ...user.data, role: newRole },
          changed: user.data.role !== newRole,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleOpenDialogConf = (selectedUser) => {
    setSelectedUser(selectedUser);
    setOpenDialogConf(true);
  };

  const handleCloseDialogConf = () => {
    setOpenDialogConf(false);
  };

  const handleNavigate = () => {
    navigate('/adminUsersConfigAddNewUser');
  };

  const handleBlockUser = async () => {
    const userRef = doc(db, 'users', selectedUser.id);

    try {
      await updateDoc(userRef, {
        blocked: true,
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

  const handleUnblockUser = async (user) => {
    if (!user) {
      return;
    }
    const userRef = doc(db, 'users', user.id);

    try {
      await updateDoc(userRef, {
        blocked: false,
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

  const handleSaveUserChange = async (user) => {
    const userRef = doc(db, 'users', user.id);
    try {
      await updateDoc(userRef, {
        role: editRole,
      });
    } catch (error) {
      setOpenErrorSnackbar(true);
    }
    setOpenSuccessSnackbar(true);
    startLoading();
    fetchTotalCount();
    fetchData();
  };

  const handleOpenNotificationSendDialog = (user) => {
    setSelectedUser(user);
    setOpenNotificationSendDialog(true);
  };

  const handleCloseNotificationSendDialog = () => {
    setOpenNotificationSendDialog(false);
  };

  const handleSubmitNotificationSend = async (event) => {
    event.preventDefault();
    if (notificationTitle === '' || notificationText === '') {
      return;
    }
    setLoadingSubmit(true);
    const notificationsRef = collection(db, 'notifications');
    const statusNotificationType = notificationTitle;
    const notificationContent = notificationText;
    let currentDate = new Date();

    try {
      await addDoc(notificationsRef, {
        uid: selectedUser.id,
        type: statusNotificationType,
        content: notificationContent,
        dateTime: currentDate,
      });
    } catch (error) {
      setErrorSnackbarMessage('Błąd wysyłania powiadomienia. Spróbuj ponownie później.');
      setOpenErrorSnackbar(true);
    }
    setOpenSuccessSnackbar(true);
    setLoadingSubmit(false);
    setOpenNotificationSendDialog(false);
    startLoading(true);
    fetchTotalCount();
    fetchData();
  };

  const handleChangeIsBlockedSearch = (event) => {
    setIsBlockedSearch(event.target.value);
  };

  const handleChangeNotificationTitle = (event) => {
    setNotificationTitle(event.target.value);
  };

  const handleChangeNotificationText = (event) => {
    setNotificationText(event.target.value);
  };

  const startLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    setUsers([]);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setPageDocs({});
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  // const handleSubmitEdit = async (event) => {
  //   event.preventDefault();

  //   setLoadingSubmit(true);
  //   await sleep(2000);
  //   const servicesReservationsEditRef = doc(db, 'services-reservations', selectedReservation.id);
  //   const notificationsRef = collection(db, 'notifications');
  //   const statusNotificationType = 'Zmiana statusu rezerwacji';
  //   const notificationContent =
  //     'Status twojej rezerwacji na ' +
  //     selectedReservation.data.serviceType +
  //     ' został zmieniony z ' +
  //     selectedReservation.data.status +
  //     ' na ' +
  //     editReservationStatus +
  //     '. ' +
  //     clientReservationNote;
  //   let currentDate = new Date();
  //   try {
  //     if (editReservationStatus === 'Anulowano' || editReservationStatus === 'Ukończono') {
  //       await updateDoc(servicesReservationsEditRef, {
  //         status: editReservationStatus,
  //         isActive: false,
  //       });
  //     } else {
  //       await updateDoc(servicesReservationsEditRef, {
  //         status: editReservationStatus,
  //       });
  //     }

  //     await addDoc(notificationsRef, {
  //       uid: selectedReservation.data.uid,
  //       type: statusNotificationType,
  //       content: notificationContent,
  //       dateTime: currentDate,
  //     });

  //     setOpenSuccessSnackbar(true);
  //   } catch (error) {
  //     setErrorSnackbarMessage('Błąd serwera: ', error);
  //     setOpenErrorSnackbar(true);
  //   }
  //   setLoadingSubmit(false);
  //   startLoading(true);
  //   fetchData();
  // };

  function createQueryConditions(surnameSearch, roleSearch, isBlockedSearch) {
    let conditions = [];

    if (surnameSearch !== '') {
      const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
      const formattedSurname = capitalizeFirstLetter(surnameSearch);
      const endSurname =
        formattedSurname.slice(0, -1) +
        String.fromCharCode(formattedSurname.charCodeAt(formattedSurname.length - 1) + 1);

      conditions.push(where('surname', '>=', formattedSurname), where('surname', '<', endSurname));
    }

    if (roleSearch !== '' && roleSearch !== 'all') {
      conditions.push(where('role', '==', roleSearch));
    }

    if (isBlockedSearch !== '') {
      conditions.push(where('blocked', '==', isBlockedSearch));
    }

    return conditions;
  }

  const fetchTotalCount = async () => {
    try {
      const usersRef = collection(db, 'users');
      const conditions = createQueryConditions(surnameSearch, roleSearch, isBlockedSearch);
      const q = query(usersRef, ...conditions);

      const querySnapshot = await getDocs(q);
      setTotalCount(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  const fetchData = async () => {
    const usersRef = collection(db, 'users');
    const conditions = createQueryConditions(surnameSearch, roleSearch, isBlockedSearch);
    try {
      let q;
      if (page === 0) {
        q = query(usersRef, ...conditions, orderBy('surname'), limit(rowsPerPage));
      } else {
        const startAtDoc = pageDocs[page] || null; // Adjust to use the current page
        q = query(
          usersRef,
          ...conditions,
          orderBy('surname'),
          startAfter(startAtDoc),
          limit(rowsPerPage)
        );
      }

      const querySnapshot = await getDocs(q);
      const newUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
        changed: false,
      }));
      setUsers(newUsers);

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
  }, [page, rowsPerPage, surnameSearch, roleSearch, isBlockedSearch]);

  return (
    <>
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: 'Użytkownicy' }]} />
        </Box>
        <Stack spacing={1} sx={{ margin: 1 }}>
          <SimpleCard title="Filtrowanie użytkowników">
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
                        <TextField
                          id="outlined-basic"
                          label="Nazwisko użytkownika"
                          variant="outlined"
                          onChange={handleChangeSurnameSearch}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-1">Rola</InputLabel>
                        <Select
                          labelId="select-label-1"
                          id="select-label-1"
                          name={roleSearch}
                          label="Rola"
                          onChange={handleChangeRoleSearch}
                          defaultValue={'all'}
                        >
                          <MenuItem value={'all'}>Wszyscy</MenuItem>
                          <MenuItem value={'USER'}>Klienci</MenuItem>
                          <MenuItem value={'WORKER'}>Pracownicy</MenuItem>
                          <MenuItem value={'ADMIN'}>Administratorzy</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xl={4} xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel id="select-label-2">Pokaż zablokowanych</InputLabel>
                        <Select
                          labelId="select-label-2"
                          id="select-label-2"
                          name={isBlockedSearch}
                          label="Pokaż zablokowanych"
                          onChange={handleChangeIsBlockedSearch}
                          defaultValue={false}
                        >
                          <MenuItem value={false}>Nie</MenuItem>
                          <MenuItem value={true}>Tak</MenuItem>
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
            <SimpleCard title="Użytkownicy">
              <Button variant="contained" color="success" onClick={handleNavigate}>
                +Dodaj nowego użytkownika
              </Button>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box overflow="auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">e-mail</TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          Imie
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          Nazwisko
                        </TableCell>
                        <TableCell align="center">Rola</TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'table-cell', md: 'none' } }}
                        ></TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'table-cell', md: 'none' } }}
                        ></TableCell>
                        {!isBlockedSearch && (
                          <TableCell align="center">{isMobile ? 'Wiad.' : 'Wiadomość'}</TableCell>
                        )}
                        {isBlockedSearch === false ? (
                          <TableCell align="center">{isMobile ? 'Zab.' : 'Zablokuj'}</TableCell>
                        ) : (
                          <TableCell align="center">{isMobile ? 'Odb.' : 'Odblokuj'}</TableCell>
                        )}

                        {isAnyUserChanged && <TableCell align="center">Zapisz</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users &&
                        users.map((user, index) => (
                          <TableRow key={index}>
                            <TableCell align="left">{user.data.email}</TableCell>
                            <TableCell
                              align="center"
                              sx={{ display: { xs: 'none', md: 'table-cell' } }}
                            >
                              {user.data.name}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ display: { xs: 'none', md: 'table-cell' } }}
                            >
                              {user.data.surname}
                            </TableCell>
                            <TableCell align="center">
                              <FormControl>
                                <InputLabel id="select-label-3">Rola</InputLabel>
                                <Select
                                  id="select-label-3"
                                  label="Rola"
                                  onChange={(e) => handleEditRole(user.id, e)}
                                  value={user.data.role}
                                >
                                  <MenuItem value={'USER'}>Klient</MenuItem>
                                  <MenuItem value={'WORKER'}>Pracownik</MenuItem>
                                  <MenuItem value={'ADMIN'}>Administrator</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ display: { xs: 'table-cell', md: 'none' } }}
                            ></TableCell>
                            <TableCell
                              align="center"
                              sx={{ display: { xs: 'table-cell', md: 'none' } }}
                            ></TableCell>
                            {!isBlockedSearch && (
                              <TableCell align="center">
                                <IconButton
                                  onClick={() => {
                                    handleOpenNotificationSendDialog(user);
                                  }}
                                >
                                  <Icon color="warning">message</Icon>
                                </IconButton>
                              </TableCell>
                            )}
                            {user.data.blocked === false ? (
                              <TableCell align="center">
                                <IconButton
                                  onClick={() => {
                                    handleOpenDialogConf(user);
                                  }}
                                >
                                  <Icon color="error">block</Icon>
                                </IconButton>
                              </TableCell>
                            ) : (
                              <TableCell align="center">
                                <IconButton
                                  onClick={() => {
                                    handleUnblockUser(user);
                                  }}
                                >
                                  <Icon color="warning">emoji_emotions</Icon>
                                </IconButton>
                              </TableCell>
                            )}

                            {user.changed && (
                              <TableCell align="center">
                                <IconButton
                                  onClick={() => {
                                    handleSaveUserChange(user);
                                  }}
                                >
                                  <Icon color="primary">check</Icon>
                                </IconButton>
                              </TableCell>
                            )}
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
        onClose={handleCloseNotificationSendDialog}
        aria-labelledby="customized-dialog-title"
        open={openNotificationSendDialog}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleCloseNotificationSendDialog}>
          Wysyłanie powiadomienia do "{selectedUser && selectedUser.data.email}"
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleSubmitNotificationSend}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                Tytuł powiadomienia:
              </Grid>
              <Grid item xs={8}>
                <TextField
                  multiline
                  minRows={1}
                  placeholder="Wpisz tekst..."
                  variant="outlined"
                  name={notificationTitle}
                  onChange={handleChangeNotificationTitle}
                />
              </Grid>
              <Grid item xs={4}>
                Treść:
              </Grid>
              <Grid item xs={8}>
                <TextField
                  multiline
                  minRows={3}
                  placeholder="Wpisz tekst..."
                  variant="outlined"
                  name={notificationText}
                  onChange={handleChangeNotificationText}
                />
              </Grid>
              <Grid item xs={4}>
                <LoadingButton
                  type="submit"
                  color="primary"
                  variant="contained"
                  startIcon={<SendIcon />}
                  loading={loadingSubmit}
                  sx={{ mb: 2, mt: 1 }}
                >
                  Wyślij
                </LoadingButton>
              </Grid>
            </Grid>
          </form>
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
          Czy na pewno chcesz zablokować użytkownika?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialogConf} color="primary">
            Anuluj
          </Button>

          <Button color="primary" onClick={handleBlockUser}>
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

export default AdminUsersConfig;
