import { Box, Button, Card, Grid, styled, TextField, Alert } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './ForgotPassword.module.css';

import useAuth from 'app/hooks/useAuth';

import * as Yup from 'yup';

const FlexBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const JustifyBox = styled(FlexBox)(() => ({
  justifyContent: 'center',
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: 32,
  background: theme.palette.background.default,
}));

const ForgotPasswordRoot = styled(JustifyBox)(() => ({
  background: '#1A2038',
  minHeight: '100vh !important',
  '& .card': {
    maxWidth: 800,
    margin: '1rem',
    borderRadius: 12,
  },
}));

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);
      resetPassword(email);
      setMessage('Instrukcje dotyczące zmiany hasła zostały wysłane na twoją skrzynkę mailową');
    } catch {
      setError('Błąd resetowania hasła!');
    }

    setLoading(false);
  };

  return (
    <ForgotPasswordRoot>
      <Card className="card">
        <h1 className={classes.h1}>Resetowanie hasła</h1>
        <Grid container>
          <Grid item xs={12}>
            <JustifyBox p={4}>
              <img
                width="300"
                src="/assets/images/illustrations/password-reset-illustration.svg"
                alt=""
              />
            </JustifyBox>

            <ContentBox>
              <form onSubmit={handleFormSubmit}>
                {error && (
                  <Alert sx={{ m: 0, marginBottom: 2 }} severity="error" variant="filled">
                    {error}
                  </Alert>
                )}
                {message && (
                  <Alert sx={{ m: 0, marginBottom: 2 }} severity="success" variant="filled">
                    {message}
                  </Alert>
                )}
                <TextField
                  required
                  type="email"
                  name="email"
                  size="small"
                  label="Email"
                  value={email}
                  variant="outlined"
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3, width: '100%' }}
                />

                <Button fullWidth variant="contained" color="primary" type="submit">
                  Zresetuj hasło
                </Button>

                <Button
                  fullWidth
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ mt: 2 }}
                >
                  Wróć
                </Button>
              </form>
            </ContentBox>
          </Grid>
        </Grid>
      </Card>
    </ForgotPasswordRoot>
  );
};

export default ForgotPassword;
