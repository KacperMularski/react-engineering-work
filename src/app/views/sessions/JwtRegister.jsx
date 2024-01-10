import { useTheme } from '@emotion/react';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, TextField, Alert } from '@mui/material';
import { Box, styled } from '@mui/system';
import { Paragraph } from 'app/components/Typography';
import useAuth from 'app/hooks/useAuth';
import { Formik } from 'formik';
import React, { useState } from 'react';
import classes from './JwtRegister.module.css';
import { NavLink, useNavigate } from 'react-router-dom';

import * as Yup from 'yup';

const FlexBox = styled(Box)(() => ({ display: 'flex', alignItems: 'center' }));

const JustifyBox = styled(FlexBox)(() => ({ justifyContent: 'center' }));

const ContentBox = styled(JustifyBox)(() => ({
  height: '100%',
  padding: '32px',
  background: 'rgba(0, 0, 0, 0.01)',
}));

const JWTRegister = styled(JustifyBox)(() => ({
  background: '#1A2038',
  minHeight: '100vh !important',
  '& .card': {
    maxWidth: 800,
    minHeight: 400,
    margin: '1rem',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
  },
}));

// inital login credentials
const initialValues = {
  email: '',
  password: '',
  passwordRepeat: '',
  remember: true,
};

// form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Hasło musi zawierać przynajmniej 6 znaków')
    .required('Hasło jest wymagane'),
  passwordRepeat: Yup.string()
    .oneOf([Yup.ref('password')], 'Hasło nie pasuje!')
    .required('Hasło jest wymagane'),
  email: Yup.string().email('Nieprawidłowy adres email').required('Adres email jest wymagany!'),
});

const JwtRegister = () => {
  const theme = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState(false);

  const handleFirebaseError = (registerError) => {
    if (registerError.code === 'auth/email-already-in-use') {
      setRegisterError('Podany adres email jest już w użyciu');
    } else {
      setRegisterError('Wystąpił nieoczekiwany błąd. Proszę spróbuj ponownie później.');
    }
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    setRegisterError(null);
    try {
      await register(values.email, values.password);
      navigate('/');
      setLoading(false);
    } catch (registerError) {
      handleFirebaseError(registerError);
      setLoading(false);
    }
  };

  return (
    <JWTRegister>
      <Card className="card">
        <Grid container>
          <Grid item sm={6} xs={12}>
            <ContentBox>
              <img
                width="100%"
                alt="Register"
                src="/assets/images/illustrations/car-repair-illustration-register.webp"
              />
            </ContentBox>
          </Grid>

          <Grid item sm={6} xs={12}>
            <h1 className={classes.h1}>Rejestracja</h1>
            <Box p={4} height="100%">
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type="password"
                      label="Wprowadź hasło"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.password}
                      onChange={handleChange}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      name="passwordRepeat"
                      type="password"
                      label="Wprowadź hasło ponownie"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.passwordRepeat}
                      onChange={handleChange}
                      helperText={touched.passwordRepeat && errors.passwordRepeat}
                      error={Boolean(errors.passwordRepeat && touched.passwordRepeat)}
                      sx={{ mb: 2 }}
                    />

                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={loading}
                      variant="contained"
                      sx={{ mb: 2, mt: 1 }}
                    >
                      Zarejestruj
                    </LoadingButton>

                    <Paragraph>
                      Posiadasz już konto?
                      <NavLink
                        to="/session/signin"
                        style={{ color: theme.palette.primary.main, marginLeft: 5 }}
                      >
                        Logowanie
                      </NavLink>
                    </Paragraph>
                  </form>
                )}
              </Formik>
              {registerError && (
                <Alert sx={{ m: 0, marginTop: 2 }} severity="error" variant="filled">
                  {registerError}
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>
    </JWTRegister>
  );
};

export default JwtRegister;
