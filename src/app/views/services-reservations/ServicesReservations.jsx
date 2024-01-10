import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  FormControl,
  Stack,
  TextField,
  styled,
  Icon,
  Typography,
  Alert,
} from '@mui/material';
import { DatePicker } from 'formik-mui-lab';
import { LocalizationProvider } from '@mui/x-date-pickers';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { SimpleCard, Breadcrumb } from 'app/components';
import { LoadingButton } from '@mui/lab';
import { Field, Formik } from 'formik';
import SelectField from './form-elements/SelectField';
import { startOfDay, isSameDay, addDays } from 'date-fns';
import { addDoc, collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from 'firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import SuccessDialog from './reservations-elements/SuccessDialog';
import useAuth from 'app/hooks/useAuth';

import * as Yup from 'yup';

const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

const initialValues = {
  serviceType: '',
  date: '',
  name: '',
  surname: '',
  vinNumber: 'WVGZZZ5NZ8WE31284',
};

// form field validation schema
const validationSchema = Yup.object().shape({
  serviceType: Yup.string().required('To pole jest wymagane'),
  name: Yup.string().required('Imię jest wymagane'),
  surname: Yup.string().required('Nazwisko jest wymagane'),
  date: Yup.date().nullable().required('To pole jest wymagane'),
  vinNumber: Yup.string()
    .matches('(?=.*d|[A-Z])(?=.*[A-Z])[A-Z0-9]{17}', 'Nieprawidłowy format numeru VIN ')
    .required('VIN jest wymagany'),
});

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}));

const ServicesReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reservationDateError, setReservationDateError] = useState(false);
  const [reservationError, setReservationError] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationSuccessOpenDialog, setReservationSuccessOpenDialog] = useState(false);

  const [datesFromDatabase, setDatesFromDatabase] = useState([]);
  const today = new Date();

  const servicesReservationsDocRef = collection(db, 'services-reservations');
  const q = query(servicesReservationsDocRef, where('date', '>=', today));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(q);
        const dates = [];
        querySnapshot.forEach((doc) => {
          const docDate = doc.data().date;
          const dateObject = docDate.toDate();
          const formattedDate = dateObject.toISOString().split('T')[0];
          dates.push(formattedDate);
        });
        setDatesFromDatabase(dates);
      } catch (error) {
        setReservationError('Błąd serwera:', error);
      }
    };

    fetchData();
  }, []);

  const handleReservationSuccessOpenDialog = () => {
    setReservationSuccessOpenDialog(true);

    setTimeout(() => {
      setReservationSuccessOpenDialog(false);
      navigate('/');
    }, 5000);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    await sleep(2000);
    setReservationDateError(null);
    const isEnteredDateDisabled = disabledDates.some((disabledDate) =>
      isSameDay(values.date, disabledDate)
    );
    if (isEnteredDateDisabled) {
      setReservationDateError('Wprowadzona data została już zarezerwowana. Spróbuj ponownie!');
      values.date = null;
      setLoading(false);
      return;
    }
    try {
      await addDoc(servicesReservationsDocRef, {
        serviceType: values.serviceType,
        date: values.date,
        name: values.name,
        surname: values.surname,
        vinNumber: values.vinNumber,
        uid: user.uid,
        isActive: true,
        status: 'Oczekiwanie',
      });
      setReservationSuccess(
        'Twoja rezerwacja została dodana pomyślnie. Za chwilę nastąpi przekierowanie na stronę główną.'
      );
      handleReservationSuccessOpenDialog();
    } catch (error) {
      setReservationError('Błąd serwera:', error);
    }
  };

  const maxDaysFromToday = 100;
  const minDate = new Date('2024-01-01');
  const maxDate = addDays(new Date('2024-01-01'), 365);
  const disabledDates = datesFromDatabase.map((dateString) => new Date(dateString));

  const shouldDisableDate = (day) => {
    return disabledDates.some((disabledDay) => isSameDay(day, disabledDay));
  };
  return (
    <Container>
      <SuccessDialog open={reservationSuccessOpenDialog} message={reservationSuccess} />
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Rezerwacje usług', path: '/servicesReservations' },
            { name: 'Dokonaj rezerwacji' },
          ]}
        />
      </Box>
      <Stack spacing={2}>
        <SimpleCard title="Jak dokonać rezerwacji online?">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon color={'primary'}>looks_one</Icon>
            <Typography>
              Wybierz interesującą Cię usługę (tylko niektóre z naszych usług warsztatowych dostępne
              są w formie szybkiej rezerwacji online)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon color={'primary'}>looks_two</Icon>
            <Typography>Określ termin wykonania usługi w naszym warsztacie</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon color={'primary'}>looks_3</Icon>
            <Typography>Wprowadź niezbędne dane osobowe</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon color={'primary'}>looks_4</Icon>
            <Typography>
              Sukces! Udało Ci się zarezerować termin wykonania usługi. W przypadku chęci anulowania
              rezerwacji, odwiedź zakładkę "Moje rezerwacje"
            </Typography>
          </Box>
        </SimpleCard>
        <SimpleCard title="Rezerwacja usług warsztatowych">
          <Formik
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={validationSchema}
          >
            {({ values, errors, touched, handleSubmit, handleBlur, handleChange }) => (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Grid>
                    <SelectField
                      label="Wybierz rodzaj usługi"
                      name="serviceType"
                      onBlur={handleBlur}
                      options={[
                        {
                          label: 'Przegląd i badanie stanu technicznego pojazdu',
                          value: 'Przegląd i badanie stanu technicznego pojazdu',
                        },
                        {
                          label: 'Serwis olejowy i wymiana filtrów',
                          value: 'Serwis olejowy i wymiana filtrów',
                        },
                        { label: 'Serwis klimatyzacji', value: 'Serwis klimatyzacji' },
                        {
                          label: 'Naprawy blacharsko-lakiernicze',
                          value: 'Naprawy blacharsko-lakiernicze',
                        },
                        {
                          label: 'Wymiana zużytych lub niesprawnych częsci',
                          value: 'Wymiana zużytych lub niesprawnych częsci',
                        },
                        { label: 'Wymiana opon', value: 'Wymiana opon' },
                      ]}
                    />
                  </Grid>
                  <Grid>
                    <FormControl sx={{ width: '100%' }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Field
                          component={DatePicker}
                          name="date"
                          error={Boolean(errors.date && touched.date)}
                          label="Data rezerwacji"
                          shouldDisableDate={shouldDisableDate}
                          minDate={minDate}
                          maxDate={maxDate}
                          maxDaysAhead={maxDaysFromToday}
                        />
                      </LocalizationProvider>
                      {reservationDateError && (
                        <Alert sx={{ m: 0, marginTop: 1 }} severity="error" variant="filled">
                          {reservationDateError}
                        </Alert>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      size="normal"
                      name="name"
                      label="Wprowadź imię"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.name}
                      onChange={handleChange}
                      helperText={touched.name && errors.name}
                      error={Boolean(errors.name && touched.name)}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      size="normal"
                      name="surname"
                      label="Wprowadź nazwisko"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.surname}
                      onChange={handleChange}
                      helperText={touched.surname && errors.surname}
                      error={Boolean(errors.surname && touched.surname)}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      size="normal"
                      name="vinNumber"
                      label="Wprowadź numer VIN pojazdu"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.vinNumber}
                      onChange={handleChange}
                      helperText={touched.vinNumber && errors.vinNumber}
                      error={Boolean(errors.vinNumber && touched.vinNumber)}
                    />
                  </Grid>

                  <Grid>
                    <LoadingButton
                      type="submit"
                      color="primary"
                      variant="contained"
                      loading={loading}
                      sx={{ mb: 2, mt: 1 }}
                    >
                      Zarezerwuj
                    </LoadingButton>
                  </Grid>
                </Stack>
              </form>
            )}
          </Formik>
          {reservationError && (
            <Alert sx={{ m: 0, marginTop: 1 }} severity="error" variant="filled">
              {reservationError}
            </Alert>
          )}
        </SimpleCard>
      </Stack>
    </Container>
  );
};

export default ServicesReservations;
