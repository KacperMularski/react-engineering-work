import React, { useState, useEffect } from 'react';
import {
  collection,
  orderBy,
  query,
  getDocs,
  startAfter,
  endBefore,
  limit,
  limitToLast,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from 'firebase';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import {
  Box,
  IconButton,
  Icon,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  CardContent,
  Grid,
  Alert,
  Slide,
  Button,
  DialogContentText,
  DialogActions,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import useAuth from 'app/hooks/useAuth';
import { Breadcrumb, SimpleCard } from 'app/components';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';

const StyledTable = styled(Table)(() => ({
  whiteSpace: 'pre',
  '& thead': {
    '& tr': { '& th': { paddingLeft: 0, paddingRight: 0 } },
  },
  '& tbody': {
    '& tr': { '& td': { paddingLeft: 0, textTransform: 'capitalize' } },
  },
}));

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

function ActiveRepairOrders() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});

  const [selectedRepairOrder, setSelectedRepairOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogConf, setOpenDialogConf] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const repairOrdersRef = collection(db, 'repair-orders');

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
    setSelectedRepairOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialogConf = (order) => {
    setSelectedRepairOrder(order);
    setOpenDialogConf(true);
  };

  const handleCloseDialogConf = () => {
    setOpenDialogConf(false);
  };

  const handleDeleteOrder = async () => {
    const repairOrdersRefDisable = doc(db, 'repair-orders', selectedRepairOrder.id);
    try {
      await updateDoc(repairOrdersRefDisable, {
        status: 'Anulowano',
        isActive: false,
      });
      console.log('Dokument został zaktualizowany pomyślnie!');
    } catch (error) {
      console.error('Błąd podczas aktualizacji dokumentu:', error);
    }
    setOpenDialogConf(false);
    setOpenSuccessSnackbar(true);
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const fetchTotalCount = async () => {
    const uid = user.uid;
    const q = query(repairOrdersRef, where('isActive', '==', true), where('uid', '==', uid));
    try {
      const querySnapshot = await getDocs(q);
      setTotalCount(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  const fetchData = async () => {
    try {
      const uid = user.uid;
      let q;
      if (page === 0) {
        q = query(
          repairOrdersRef,
          where('isActive', '==', true),
          where('uid', '==', uid),
          orderBy('dateTime'),
          limit(rowsPerPage)
        );
      } else {
        const startAtDoc = pageDocs[page] || null; // Adjust to use the current page
        q = query(
          repairOrdersRef,
          orderBy('dateTime'),
          startAfter(startAtDoc),
          limit(rowsPerPage),
          where('isActive', '==', true),
          where('uid', '==', uid)
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
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchTotalCount();
    fetchData();
  }, [page, rowsPerPage]);

  return (
    <>
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: 'Przeglądaj zlecenia', path: '/activeRepairOrders' },
              { name: 'Aktywne' },
            ]}
          />
        </Box>
        <SimpleCard title="Aktywne zlecenia">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Box width="100%" overflow="auto">
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Rodzaj usterki</TableCell>
                    <TableCell align="center">Marka</TableCell>
                    <TableCell align="center">Model</TableCell>
                    <TableCell align="center">Nazwisko</TableCell>
                    <TableCell align="center">Data</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Anuluj</TableCell>
                    <TableCell align="right">Więcej</TableCell>
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
                          <IconButton onClick={() => handleOpenDialogConf(order)}>
                            <Icon color="error">close</Icon>
                          </IconButton>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenDialog(order)}>
                            <Icon sx={{ color: 'blue' }}>info</Icon>
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
      </Container>
      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="customized-dialog-title"
        open={openDialog}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleCloseDialog}>
          Szczegóły zlecenia
        </DialogTitle>

        <DialogContent>
          {selectedRepairOrder && (
            <Grid container spacing={3}>
              <Grid item xs={4}>
                Rodzaj usterki:
              </Grid>
              <Grid item xs={8}>
                <b> {selectedRepairOrder.data.faultType} </b>
              </Grid>

              <Grid item xs={4}>
                Marka pojazdu:
              </Grid>
              <Grid item xs={8}>
                <b> {selectedRepairOrder.data.carBrand} </b>
              </Grid>

              <Grid item xs={4}>
                Model pojazdu:
              </Grid>
              <Grid item xs={8}>
                <b>{selectedRepairOrder.data.carModel}</b>
              </Grid>

              <Grid item xs={4}>
                Data zlecenia:
              </Grid>
              <Grid item xs={8}>
                <b>
                  {' '}
                  {selectedRepairOrder.data.dateTime
                    ? selectedRepairOrder.data.dateTime.toDate().toLocaleString()
                    : '-'}{' '}
                </b>
              </Grid>

              <Grid item xs={4}>
                Opis:
              </Grid>
              <Grid item xs={8}>
                <b>
                  {selectedRepairOrder.data.description !== ''
                    ? selectedRepairOrder.data.description
                    : 'Brak'}
                </b>
              </Grid>

              <Grid item xs={4}>
                Imię:
              </Grid>
              <Grid item xs={8}>
                <b>{selectedRepairOrder.data.name}</b>
              </Grid>

              <Grid item xs={4}>
                Nazwisko:
              </Grid>
              <Grid item xs={8}>
                <b>{selectedRepairOrder.data.surname}</b>
              </Grid>

              <Grid item xs={4}>
                Status:
              </Grid>
              <Grid item xs={8}>
                <b> {selectedRepairOrder.data.status}</b>
              </Grid>
            </Grid>
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
          Czy na pewno chcesz anulować zlecenie?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Anulowane zlecenie zostanie przeniesione do zakładki zleceń zakończonych. Tej operacji
            nie można cofnąć!
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialogConf} color="primary">
            Anuluj
          </Button>

          <Button onClick={handleDeleteOrder} color="primary">
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
    </>
  );
}

export default ActiveRepairOrders;
