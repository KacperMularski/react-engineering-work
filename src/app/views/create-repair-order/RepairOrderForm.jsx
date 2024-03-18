import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import { object } from 'yup';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as Yup from 'yup';
import useAuth from 'app/hooks/useAuth';

import { getDatabase, ref, get } from 'firebase/database';

import SelectField from './form-elements/SelectField';
import AutocompleteField from './form-elements/AutocompleteField';
import { SimpleCard } from 'app/components';
import SwitchField from './form-elements/SwitchField';

import glowPlugIcon from './form-elements/icons/glow-plug-icon.png';
import checkEngineIcon from './form-elements/icons/check-engine-icon.png';
import engineOilIcon from './form-elements/icons/engine-oil-icon.png';
import engineCoolantIcon from './form-elements/icons/engine-coolant-icon.png';
import batteryIcon from './form-elements/icons/battery-icon.png';
import compute from 'app/decision-making-system/InterferenceCompute';

const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

function RepairOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFaultType, setSelectedFaultType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const [carBrands, setCarBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);

  const db = getDatabase();
  const dataModelsRef = ref(db, 'models');
  const dataBrandsRef = ref(db, 'brands');

  useEffect(() => {
    let isMounted = true;

    get(dataModelsRef)
      .then((snapshot) => {
        if (isMounted && snapshot.exists()) {
          const data = snapshot.val();
          setCarModels(data);
        } else {
          console.log('Brak danych w bazie.');
        }
      })
      .catch((error) => {
        console.error('Błąd pobierania danych:', error);
      });

    get(dataBrandsRef)
      .then((snapshot) => {
        if (isMounted && snapshot.exists()) {
          const data = snapshot.val();
          setCarBrands(data);
        } else {
          console.log('Brak danych w bazie.');
        }
      })
      .catch((error) => {
        console.error('Błąd pobierania danych:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFaultTypeChange = (value) => {
    setSelectedFaultType(value);
  };

  const handleSelectedBrand = (value) => {
    setSelectedBrand(value);
  };

  const handleSelectedModel = (value) => {
    setSelectedModel(value);
  };

  return (
    <FormikStepper
      initialValues={{
        name: '',
        surname: '',
        fuelType: '',
        engineSuperchargingType: 'none',
        faultType: '',
        description: '',
        selectedCarBrand: '',
        selectedCarModel: '',
        engineFailure_noisyWork: false,
        engineFailure_heavyShiftingGears: false,
        engineFailure_unevenWork: false,
        engineFailure_whenAccelerating: false,
        engineFailure_increasedFuelConsumption: false,
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
      }}
      onSubmit={async (values) => {
        await sleep(3000);
        sleep(0);
        await compute(values, user);
        navigate('/activeRepairOrders');
      }}
    >
      <FormikStep
        label="Wybierz rodzaj usterki"
        validationSchema={object({
          faultType: Yup.string().required('To pole jest wymagane'),
          description: Yup.string().required('To pole jest wymagane'),
        })}
      >
        <Box paddingBottom={2}>
          <SelectField
            name="faultType"
            label="Wybierz rodzaj usterki"
            options={[
              { label: 'Silnik i osprzęt', value: 'Silnik' },
              { label: 'Układ hamulcowy', value: 'Układ hamulcowy' },
              { label: 'Klimatyzacja', value: 'Klimatyzacja' },
              { label: 'Zawieszenie', value: 'Zawieszenie' },
              { label: 'Układ kierowniczy', value: 'Układ kierowniczy' },
              { label: 'Instalacja elektryczna', value: 'Instalacja elektryczna' },
              { label: 'Inna', value: 'Inna' },
            ]}
            onChange={handleFaultTypeChange}
          />

          {selectedFaultType === 'Silnik' && (
            <>
              <Stack sx={{ marginBottom: 1 }}>
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
              </Stack>
              <Stack sx={{ marginBottom: 1 }}>
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
              </Stack>
              <Stack>
                <SimpleCard title="Kontrolki awaryjne (wybierz jeśli występują):">
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
              </Stack>
            </>
          )}
          {selectedFaultType === 2 && <></>}
          {/* ... inne warunki */}
        </Box>
        {selectedFaultType && (
          <Stack sx={{ marginBottom: 2 }}>
            <SimpleCard title="Informacje dodatkowe:">
              <Box paddingBottom={2}>
                <Field
                  multiline
                  variant="outlined"
                  name="description"
                  placeholder="Wprowadź opis usterki..."
                  component={TextField}
                  minRows={3}
                  sx={{ width: '100%' }}
                  style={{ width: '100%' }}
                />
              </Box>
            </SimpleCard>
          </Stack>
        )}
      </FormikStep>
      <FormikStep
        label="Podaj dane pojazdu"
        validationSchema={object({
          selectedCarBrand: Yup.string().required('To pole jest wymagane'),
          selectedCarModel: Yup.string().required('To pole jest wymagane'),
          fuelType: Yup.string().required('To pole jest wymagane'),
        })}
      >
        <Box paddingBottom={2}>
          <AutocompleteField
            name="selectedCarBrand"
            label="Marka"
            options={carBrands}
            onChange={handleSelectedBrand}
          />
        </Box>
        <Box paddingBottom={2}>
          <AutocompleteField
            name="selectedCarModel"
            label="Model"
            options={selectedBrand ? carModels[selectedBrand] : []}
            onChange={handleSelectedModel}
          />
        </Box>
        <Box>
          <SelectField
            name="fuelType"
            label="Rodzaj paliwa"
            options={[
              { label: 'Diesel', value: 'diesel' },
              { label: 'Benzyna', value: 'gasoline' },
              { label: 'LPG', value: 'lpg' },
            ]}
          />
        </Box>
        <Box paddingBottom={2}>
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
      </FormikStep>
      <FormikStep
        label="Podaj dane osobowe"
        validationSchema={object({
          name: Yup.string().required('To pole jest wymagane'),
          surname: Yup.string().required('To pole jest wymagane'),
        })}
      >
        <Box paddingBottom={2}>
          <Field fullWidth name="name" component={TextField} label="Imie" />
        </Box>
        <Box paddingBottom={2}>
          <Field fullWidth name="surname" component={TextField} label="Nazwisko" />
        </Box>
      </FormikStep>
    </FormikStepper>
  );
}

function FormikStep({ children }) {
  return <>{children}</>;
}

function FormikStepper({ children, ...props }) {
  const childrenArray = React.Children.toArray(children);
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);

  function isLastStep() {
    return step === React.Children.count(children) - 1;
  }

  return (
    <Formik
      {...props}
      validationSchema={React.Children.toArray(children)[step].props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
        } else {
          setStep((s) => s + 1);
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Box sx={{ marginBottom: 5 }}>
            <Stepper alternativeLabel activeStep={step}>
              {React.Children.map(children, (child, index) => (
                <Step key={child.props.label} completed={step > index || completed}>
                  <StepLabel>{child.props.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {currentChild}

          <Grid container spacing={2}>
            {step > 0 ? (
              <Grid item>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setStep((s) => s - 1);
                  }}
                >
                  Wróć
                </Button>
              </Grid>
            ) : null}
            <Grid item>
              <Button
                startIcon={isSubmitting ? <CircularProgress size="1rem" /> : <ArrowForwardIcon />}
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {isSubmitting ? 'Zatwierdzanie' : isLastStep() ? 'Zatwierdź' : 'Dalej'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}

export default RepairOrder;
