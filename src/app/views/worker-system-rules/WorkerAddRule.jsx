import React, { useState } from 'react';
import { SimpleCard, Breadcrumb } from 'app/components';
import { Box, styled } from '@mui/system';
import { Formik, Field } from 'formik';
import { CheckboxWithLabel } from 'formik-material-ui';
import SwitchField from './utils/form-elements/SwitchField';
import SelectField from './utils/form-elements/SelectField';
import {
  Snackbar,
  Alert,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogActions,
  Slide,
} from '@mui/material';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import { LoadingButton } from '@mui/lab';
import { getDatabase, ref, get, set } from 'firebase/database';

import * as Yup from 'yup';

const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

import translateFieldName from './utils/translate';

//ikony
import glowPlugIcon from './utils/form-elements/icons/glow-plug-icon.png';
import checkEngineIcon from './utils/form-elements/icons/check-engine-icon.png';
import engineCoolantIcon from './utils/form-elements/icons/engine-coolant-icon.png';
import engineOilIcon from './utils/form-elements/icons/engine-oil-icon.png';
import batteryIcon from './utils/form-elements/icons/battery-icon.png';

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

const initialValues = {
  engineFailure_unevenWork: false,
  engineFailure_whenAccelerating: false,
  engineFailure_increasedFuelConsumption: false,
  engineFailure_noisyWork: false,
  engineFailure_heavyShiftingGears: false,
  engineFailure_lossOfEnginePower: false,
  engineFailure_noises: false,
  engineFailure_vibrationsWhileDriving: false,
  engineFailure_suddenEngineStop: false,
  engineFailure_temperatureDifficultyStartingTheEngine: 'none',
  engineFailure_exhaustPipeSmokeColor: 'none',
  engineFailure_warningLightsGlowPlug: false,
  engineFailure_warningLightsCheckEngine: false,
  engineFailure_warningLightsEngineCoolant: false,
  engineFailure_warningLightsEngineOil: false,
  engineFailure_warningLightsBattery: false,
  fuelType: 'none',
  engineSuperchargingType: 'none',
  issue: '',
  solution: '',
  minSymptoms: '',
};

const validationSchema = Yup.object().shape({
  issue: Yup.string().required('To pole jest wymagane'),
  solution: Yup.string().required('To pole jest wymagane'),
  minSymptoms: Yup.number()
    .required('To pole jest wymagane')
    .test('is-positive', 'Wartość musi być większa od 0', (value) => value > 0),
});

function WorkerAddRule() {
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [openDialogConf, setOpenDialogConf] = useState(false);
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);

  const handleOpenDialogConf = async (values) => {
    // Filtrujemy wartości formularza
    const filteredValues = Object.entries(values)
      .filter(([key, value]) => {
        // Wykluczamy wartości false, null oraz puste ciągi znaków
        return value !== false && value !== 'none' && value !== '';
      })
      .reduce((acc, [key, value]) => {
        // Tworzymy obiekt zawierający tylko pola z wartościami różnymi od false, null oraz pustego ciągu znaków
        if (key === 'issue' || key === 'solution' || key === 'minSymptoms') {
          // Dodajemy pola issue, solution, minSymptoms bezpośrednio do głównego obiektu
          acc[key] = value;
        } else {
          // Dodajemy pola, które nie są issue, solution, minSymptoms do obiektu symptomRequirements
          if (!acc.symptomRequirements) {
            acc.symptomRequirements = [];
          }
          acc.symptomRequirements.push({ field: key, values: [value] });
        }
        return acc;
      }, {});
    setData(filteredValues);
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

  const handleSubmit = async () => {
    setOpenDialogConf(false);
    if (!data) {
      setErrorSnackbarMessage('Błąd dodawania reguły!');
      setOpenErrorSnackbar(true);
      return;
    }
    setLoading(true);
    await sleep(2000);
    const database = getDatabase();
    const knowledgeBaseRef = ref(database, 'knowledgeBaseEngine');

    // Pobierz listę obiektów z bazy danych
    const snapshot = await get(knowledgeBaseRef);

    // Znajdź najwyższy istniejący indeks
    let maxIndex = -1;
    snapshot.forEach((childSnapshot) => {
      const index = parseInt(childSnapshot.key);
      if (index > maxIndex) {
        maxIndex = index;
      }
    });

    // Dodaj 1 do najwyższego indeksu
    const newId = maxIndex + 1;

    // Dodajemy wartości do bazy danych
    const newKnowledgeBaseRef = ref(database, 'knowledgeBaseEngine/' + newId.toString());
    set(newKnowledgeBaseRef, data)
      .then(() => {
        setErrorSnackbarMessage('');
        setLoading(false);
        setOpenSuccessSnackbar(true);
      })
      .catch((error) => {
        setLoading(false);
        setErrorSnackbarMessage('Błąd dodawania reguły: ', error);
        setOpenErrorSnackbar(true);
      });

    setLoading(false);
  };

  return (
    <>
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: 'Dodawanie reguł' }]} />
        </Box>

        <Formik
          onSubmit={handleOpenDialogConf}
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <SimpleCard title="Objawy ogólne">
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_unevenWork"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Nierówna praca silnika' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_whenAccelerating"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Szarpanie podczas przyśpieszania' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_increasedFuelConsumption"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Wzrost zużycia paliwa' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_noisyWork"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Głośna praca' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_heavyShiftingGears"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Trudności przy zmianie biegów (lub zgrzyty)' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_lossOfEnginePower"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Nagły spadek mocy' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_noises"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Odgłosy stukania lub klekotanie' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_vibrationsWhileDriving"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Odczuwalne wibracje podczas jazdy' }}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <Field
                      type="checkbox"
                      name="engineFailure_suddenEngineStop"
                      component={CheckboxWithLabel}
                      Label={{ label: 'Nagłe zatrzymanie pracy silnika' }}
                    />
                  </Box>
                </SimpleCard>
                <SimpleCard title="Objawy zaawansowane">
                  <Box paddingBottom={2}>
                    <SelectField
                      name="engineFailure_temperatureDifficultyStartingTheEngine"
                      label="Trudności w uruchamianiu silnika:"
                      options={[
                        { label: 'Silnik rozgrzany', value: 'warm' },
                        { label: 'Silnik zimny', value: 'cold' },
                        { label: 'Oba przypadki', value: 'both' },
                        { label: 'Brak', value: 'none' },
                      ]}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <SelectField
                      name="engineFailure_exhaustPipeSmokeColor"
                      label="Dymienie z rury wydechowej (kolor):"
                      options={[
                        { label: 'Biały', value: 'white' },
                        { label: 'Czarny', value: 'black' },
                        { label: 'Niebieski', value: 'blue' },
                        { label: 'Brak', value: 'none' },
                      ]}
                    />
                  </Box>
                </SimpleCard>
                <SimpleCard title="Kontrolki awaryjne">
                  <Box paddingBottom={2}>
                    <img src={glowPlugIcon} />
                    <SwitchField name="engineFailure_warningLightsGlowPlug" />
                  </Box>
                  <Box paddingBottom={2}>
                    <img src={checkEngineIcon} />
                    <SwitchField name="engineFailure_warningLightsCheckEngine" />
                  </Box>
                  <Box paddingBottom={2}>
                    <img src={engineCoolantIcon} />
                    <SwitchField name="engineFailure_warningLightsEngineCoolant" />
                  </Box>
                  <Box paddingBottom={2}>
                    <img src={engineOilIcon} />
                    <SwitchField name="engineFailure_warningLightsEngineOil" />
                  </Box>
                  <Box paddingBottom={2}>
                    <img src={batteryIcon} />
                    <SwitchField name="engineFailure_warningLightsBattery" />
                  </Box>
                </SimpleCard>
                <SimpleCard title="Rodzaj paliwa i doładowanie">
                  <Box>
                    <SelectField
                      name="fuelType"
                      label="Rodzaj paliwa"
                      options={[
                        { label: 'Nieistotne', value: 'none' },
                        { label: 'Diesel', value: 'diesel' },
                        { label: 'Benzyna', value: 'gasoline' },
                        { label: 'LPG', value: 'lpg' },
                      ]}
                    />
                  </Box>
                  <Box>
                    <SelectField
                      name="engineSuperchargingType"
                      label="Doładowanie"
                      options={[
                        { label: 'Brak', value: 'none' },
                        { label: 'Turbosprężarkowe', value: 'turbo' },
                        { label: 'Mechaniczne (kompresor)', value: 'compressor' },
                      ]}
                    />
                  </Box>
                </SimpleCard>
                <SimpleCard title="Pozostałe dane">
                  <Box paddingBottom={2}>
                    <TextField
                      fullWidth
                      size="normal"
                      name="issue"
                      label="Nazwa usterki"
                      variant="outlined"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      helperText={touched.issue && errors.issue}
                      error={Boolean(errors.issue && touched.issue)}
                    />
                  </Box>
                  <Box paddingBottom={2}>
                    <TextField
                      fullWidth
                      size="normal"
                      name="solution"
                      label="Rozwiązanie"
                      variant="outlined"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      helperText={touched.solution && errors.solution}
                      error={Boolean(errors.solution && touched.solution)}
                    />
                  </Box>
                  <Box>
                    <TextField
                      type="number"
                      fullWidth
                      size="normal"
                      name="minSymptoms"
                      label="Minimalna liczba symptomów"
                      variant="outlined"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      helperText={touched.minSymptoms && errors.minSymptoms}
                      error={Boolean(errors.minSymptoms && touched.minSymptoms)}
                    />
                  </Box>
                </SimpleCard>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LoadingButton
                    size="large"
                    type="submit"
                    color="secondary"
                    variant="contained"
                    loading={loading}
                    sx={{ mb: 2, mt: 1, marginRight: 1 }}
                  >
                    Dodaj
                  </LoadingButton>
                  <Button
                    size="large"
                    type="reset"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2, mt: 1 }}
                    onClick={() => resetForm()}
                  >
                    Wyczyść
                  </Button>
                </Box>
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
      <Dialog
        open={openDialogConf}
        keepMounted
        onClose={handleCloseDialogConf}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Podumowanie konfiguracji reguły</DialogTitle>
        <DialogContent>
          {data && (
            <SimpleCard>
              <p>Usterka: {data.issue}</p>
              <p>Rozwiązanie: {data.solution}</p>
              <ul>
                {data.symptomRequirements &&
                  data.symptomRequirements.map((requirement, index) => (
                    <li key={index}>
                      {Object.entries(requirement).map(([key, value]) => (
                        <span key={key}>{translateFieldName(value)}</span>
                      ))}
                    </li>
                  ))}
              </ul>
              <p>Min. ilość objawów: {data.minSymptoms}</p>
            </SimpleCard>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogConf} color="primary">
            Anuluj
          </Button>

          <Button color="primary" onClick={handleSubmit}>
            Dodaj
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

export default WorkerAddRule;
