import { LoadingButton } from '@mui/lab';
import { Card, Checkbox, Grid, TextField, Alert } from '@mui/material';
import { Box, styled, useTheme } from '@mui/system';
import { Paragraph } from 'app/components/Typography';
import useAuth from 'app/hooks/useAuth';
import { Formik } from 'formik';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import classes from './Login.module.css';
import * as Yup from 'yup';

import { query, getDocs, collection, where } from 'firebase/firestore';
import { db } from 'firebase';

const FlexBox = styled(Box)(() => ({ display: 'flex', alignItems: 'center' }));

const JustifyBox = styled(FlexBox)(() => ({ justifyContent: 'center' }));

const ContentBox = styled(Box)(() => ({
  height: '100%',
  padding: '32px',
  position: 'relative',
  background: 'rgba(0, 0, 0, 0.01)',
}));

const Root = styled(JustifyBox)(() => ({
  background: '#1A2038',
  minHeight: '100% !important',
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
  remember: true,
};

const validationSchema = Yup.object().shape({
  password: Yup.string().required('Hasło jest wymagane!'),
  email: Yup.string().email('Nieprawidłowy adres email').required('Email jest wymagany!'),
});

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const { login } = useAuth();

  const handleFirebaseError = (loginError) => {
    setLoginError('');
    if (loginError.code === 'auth/invalid-login-credentials') {
      setLoginError('Nieprawidłowe dane logowania');
    } else {
      setLoginError('Wystąpił nieoczekiwany błąd. Proszę spróbuj ponownie później.');
    }
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    setLoginError(null);
    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', values.email), where('blocked', '==', true));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setLoginError('Konto zostało zablokowane. Skontaktuj się z administracją.');
        setLoading(false);
        return;
      }
    } catch {
      setLoginError('Wystąpił nieoczekiwany błąd. Proszę spróbuj ponownie później.');
    }
    try {
      await login(values.email, values.password);
      navigate('/');
    } catch (loginError) {
      handleFirebaseError(loginError);
      setLoading(false);
    }
  };

  return (
    <Root>
      <Card className="card">
        <Grid container>
          <Grid item sm={6} xs={12}>
            <JustifyBox p={4} height="100%" sx={{ minWidth: 320 }}>
              <img
                src="/assets/images/illustrations/car-repair-illustration-login.webp"
                width="100%"
                alt=""
              />
            </JustifyBox>
          </Grid>

          <Grid item sm={6} xs={12}>
            <h1 className={classes.h1}>Logowanie</h1>
            <ContentBox>
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
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type="password"
                      label="Hasło"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.password}
                      onChange={handleChange}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      sx={{ mb: 1.5 }}
                    />

                    <FlexBox justifyContent="space-between">
                      <FlexBox gap={1}>
                        <Checkbox
                          size="small"
                          name="remember"
                          onChange={handleChange}
                          checked={values.remember}
                          sx={{ padding: 0 }}
                        />
                        <Paragraph>Zapamiętaj mnie</Paragraph>
                      </FlexBox>

                      <NavLink
                        to="/session/forgot-password"
                        style={{ color: theme.palette.primary.main }}
                      >
                        Zapomniałeś hasła?
                      </NavLink>
                    </FlexBox>

                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={loading}
                      variant="contained"
                      sx={{ my: 2 }}
                    >
                      Zaloguj
                    </LoadingButton>

                    <Paragraph>
                      Nie posiadasz konta?
                      <NavLink
                        to="/session/signup"
                        style={{ color: theme.palette.primary.main, marginLeft: 5 }}
                      >
                        Rejestracja
                      </NavLink>
                    </Paragraph>
                  </form>
                )}
              </Formik>
              {loginError && (
                <Alert sx={{ m: 0, marginTop: 2 }} severity="error" variant="filled">
                  {loginError}
                </Alert>
              )}
            </ContentBox>
          </Grid>
        </Grid>
      </Card>
    </Root>
  );
};

export default Login;
