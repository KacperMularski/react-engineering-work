import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MuiDialogTitle from '@mui/material/DialogTitle';
import { SimpleCard, Breadcrumb } from 'app/components';
import {
  styled,
  Box,
  Stack,
  Grid,
  Alert,
  IconButton,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material';

import * as Yup from 'yup';

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}));

// inital login credentials
const initialValues = {
  email: '',
  password: '',
  passwordRepeat: '',
  name: '',
  surname: '',
  role: '',
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
  name: Yup.string().required('Imie jest wymagane'),
  surname: Yup.string().required('Nazwisko jest wymagane'),
  role: Yup.string().required('Rola jest wymagana'),
});

const AdminUsersConfigAddNew = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState(false);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    setRegisterError('');

    try {
      const response = await fetch('http://localhost:5000/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error) {
          setRegisterError(data.error);
        } else {
          setRegisterError('Nieoczekiwany błąd podczas tworzenia użytkownika.');
        }
      } else {
        navigate('/adminUsersConfig');
      }
    } catch (error) {
      setRegisterError(error.message || 'Wystąpił problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: 'Użytkownicy', path: '/adminUsersConfig' },
              { name: 'Dodaj użytkownika' },
            ]}
          />
        </Box>
        <Stack>
          <SimpleCard title="Dodaj użytkownika">
            <Grid item sm={6} xs={12}>
              <Box height="100%">
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

                      <TextField
                        fullWidth
                        size="small"
                        name="name"
                        type="text"
                        label="Imie"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.name}
                        onChange={handleChange}
                        helperText={touched.name && errors.name}
                        error={Boolean(errors.name && touched.name)}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        name="surname"
                        type="text"
                        label="Nazwisko"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.surname}
                        onChange={handleChange}
                        helperText={touched.surname && errors.surname}
                        error={Boolean(errors.surname && touched.surname)}
                        sx={{ mb: 2 }}
                      />

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Rola</InputLabel>
                        <Select
                          name="role"
                          label="Rola"
                          value={values.role}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(errors.role && touched.role)}
                        >
                          <MenuItem value="ADMIN">Administrator</MenuItem>
                          <MenuItem value="WORKER">Pracownik</MenuItem>
                          <MenuItem value="USER">Klient</MenuItem>
                        </Select>
                        {touched.role && errors.role && (
                          <FormHelperText error>{errors.role}</FormHelperText>
                        )}
                      </FormControl>

                      <LoadingButton
                        type="submit"
                        color="primary"
                        loading={loading}
                        variant="contained"
                        sx={{ mb: 2, mt: 1 }}
                      >
                        Zapisz
                      </LoadingButton>
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
          </SimpleCard>
        </Stack>
      </Container>
    </>
  );
};

export default AdminUsersConfigAddNew;
