import React, { useState, useEffect } from 'react';
import { collection, orderBy, query, getDocs, startAfter, limit, where } from 'firebase/firestore';
import { db } from 'firebase';
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
  Grid,
  CircularProgress,
} from '@mui/material';
import useAuth from 'app/hooks/useAuth';
import { Breadcrumb, SimpleCard } from 'app/components';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';

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

function NonActiveRepairOrders() {
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
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState({});

  const [selectedRepairOrder, setSelectedRepairOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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
    return () => {
      setLoading(false);
      setTimeout(0);
    };
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

  const fetchTotalCount = async () => {
    const uid = user.uid;
    const q = query(repairOrdersRef, where('isActive', '==', false), where('uid', '==', uid));
    try {
      const querySnapshot = await getDocs(q);
      setTotalCount(querySnapshot.size);
    } catch (error) {
      console.error('Błąd wczytywania liczby dokumentów: ', error);
    }
  };

  const fetchData = async () => {
    try {
      const uid = user.uid;
      let q;
      if (page === 0) {
        q = query(
          repairOrdersRef,
          where('isActive', '==', false),
          where('uid', '==', uid),
          orderBy('dateTime'),
          limit(rowsPerPage)
        );
      } else {
        const startAtDoc = pageDocs[page] || null;
        q = query(
          repairOrdersRef,
          orderBy('dateTime'),
          startAfter(startAtDoc),
          limit(rowsPerPage),
          where('isActive', '==', false),
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
        setPageDocs((prev) => ({ ...prev, [page + 1]: lastDoc })); // Ostatni dokument
      }
    } catch (error) {
      console.error('Błąd pobierania danych: ', error);
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
              { name: 'Przeglądaj zlecenia', path: '/nonActiveRepairOrders' },
              { name: 'Ukończone' },
            ]}
          />
        </Box>
        <SimpleCard title="Ukończone zlecenia">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Box width="100%" overflow="auto">
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">{isMobile ? 'Rd.ust.' : 'Rodzaj usterki'}</TableCell>
                    <TableCell align="center">Marka</TableCell>
                    <TableCell align="center">Model</TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      Data
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      Status
                    </TableCell>
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
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {order.data.dateTime
                            ? order.data.dateTime.toDate().toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {order.data.status}
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
              <Grid item xs={5}>
                Rodzaj usterki:
              </Grid>
              <Grid item xs={4}>
                <b> {selectedRepairOrder.data.faultType} </b>
              </Grid>

              <Grid item xs={5}>
                Marka pojazdu:
              </Grid>
              <Grid item xs={4}>
                <b> {selectedRepairOrder.data.carBrand} </b>
              </Grid>

              <Grid item xs={5}>
                Model pojazdu:
              </Grid>
              <Grid item xs={4}>
                <b>{selectedRepairOrder.data.carModel}</b>
              </Grid>

              <Grid item xs={5}>
                Data zlecenia:
              </Grid>
              <Grid item xs={4}>
                <b>
                  {' '}
                  {selectedRepairOrder.data.dateTime
                    ? selectedRepairOrder.data.dateTime.toDate().toLocaleString()
                    : '-'}{' '}
                </b>
              </Grid>

              <Grid item xs={5}>
                Opis:
              </Grid>
              <Grid item xs={4}>
                <b>
                  {selectedRepairOrder.data.description !== ''
                    ? selectedRepairOrder.data.description
                    : 'Brak'}
                </b>
              </Grid>

              <Grid item xs={5}>
                Imię:
              </Grid>
              <Grid item xs={4}>
                <b>{selectedRepairOrder.data.name}</b>
              </Grid>

              <Grid item xs={5}>
                Nazwisko:
              </Grid>
              <Grid item xs={4}>
                <b>{selectedRepairOrder.data.surname}</b>
              </Grid>

              <Grid item xs={5}>
                Status:
              </Grid>
              <Grid item xs={4}>
                <b> {selectedRepairOrder.data.status}</b>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NonActiveRepairOrders;
