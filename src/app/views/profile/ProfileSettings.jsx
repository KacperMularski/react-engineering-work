import { LoadingButton } from '@mui/lab';
import { TextField, Alert, Stack, Grid, Avatar, Button, Paper } from '@mui/material';
import { Box, styled } from '@mui/system';
import { SimpleCard } from 'app/components';
import useAuth from 'app/hooks/useAuth';
import { db } from 'firebase';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from 'firebase/storage';
import { Formik } from 'formik';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as Yup from 'yup';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadingIcon from '@mui/icons-material/Downloading';

const FlexBox = styled(Box)(() => ({ display: 'flex', alignItems: 'center' }));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  flexGrow: 1,
}));

const JustifyBox = styled(FlexBox)(() => ({ justifyContent: 'center' }));

// inital login credentials
const initialValues = {
  password: '',
  passwordRepeat: '',
};

// form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Hasło musi zawierać przynajmniej 6 znaków')
    .required('Hasło jest wymagane'),
  passwordRepeat: Yup.string()
    .oneOf([Yup.ref('password')], 'Hasło nie pasuje!')
    .required('Hasło jest wymagane'),
});

const ProfileSettings = () => {
  const { user } = useAuth();
  //Zmiana hasła
  const { updatePasswordForCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  //-------------------

  //Dodawania awatara
  const [avatar, setAvatar] = useState(null);
  const [avatarURL, setAvatarURL] = useState('');
  const [progress, setProgress] = useState(0);
  const [fileInput, setFileInput] = useState(null);
  //-------------------

  const handleFormSubmit = async (values) => {
    setLoading(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    try {
      updatePasswordForCurrentUser(values.password);
      setChangePasswordSuccess('Zmiana hasła udała się pomyślnie!');
      setLoading(false);
    } catch (registerError) {
      setChangePasswordError('Wystąpił błąd podczas zmiany hasła!');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUploadWindow = () => {
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleUpload = async () => {
    if (!avatar) {
      return;
    }
    let userAvatarURL;
    const userRef = doc(db, 'users', user.uid);
    const storage = getStorage();
    const [filename, extension] = avatar.name.split('.');
    const storageRef = ref(storage, `avatars/${user.uid}.${extension}`);
    console.log(filename);
    const uploadTask = uploadBytesResumable(storageRef, avatar);
    const userData = await getDoc(userRef);
    if (userData.exists()) {
      userAvatarURL = userData.data().avatarURL;
    } else {
      console.log('Dokument nie istnieje.');
    }
    try {
      if (userAvatarURL) {
        const oldAvatarRef = ref(storage, userAvatarURL);
        await deleteObject(oldAvatarRef);
      }
      await uploadTask;
      const url = await getDownloadURL(storageRef);
      // Zapisz URL awatara w Firestore w odpowiednim dokumencie użytkownika

      // Używamy setDoc do ustawienia wartości, w tym przypadku 'avatarURL'
      await setDoc(userRef, { avatarURL: url }, { merge: true });
      setAvatarURL(url);
      console.log('Awatar został pomyślnie przesłany i zapisany w Firestore.');
    } catch (error) {
      console.error('Błąd podczas przesyłania awatara:', error.message);
    }
  };

  return (
    <Stack spacing={3} sx={{ margin: 2 }}>
      <SimpleCard title="Zmiana hasła">
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Grid>
                <Grid>
                  <TextField
                    fullWidth
                    size="normal"
                    name="password"
                    type="password"
                    label="Wprowadź nowe hasło"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.password}
                    onChange={handleChange}
                    helperText={touched.password && errors.password}
                    error={Boolean(errors.password && touched.password)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    size="normal"
                    name="passwordRepeat"
                    type="password"
                    label="Wprowadź nowe hasło ponownie"
                    variant="outlined"
                    onBlur={handleBlur}
                    value={values.passwordRepeat}
                    onChange={handleChange}
                    helperText={touched.passwordRepeat && errors.passwordRepeat}
                    error={Boolean(errors.passwordRepeat && touched.passwordRepeat)}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <LoadingButton
                  type="submit"
                  color="primary"
                  loading={loading}
                  variant="contained"
                  sx={{ mb: 2, mt: 1 }}
                >
                  Zmień hasło
                </LoadingButton>
              </Grid>
            </form>
          )}
        </Formik>
        {changePasswordSuccess && (
          <Alert sx={{ m: 0, marginTop: 2 }} severity="success" variant="filled">
            {changePasswordSuccess}
          </Alert>
        )}
        {changePasswordError && (
          <Alert sx={{ m: 0, marginTop: 2 }} severity="error" variant="filled">
            {changePasswordError}
          </Alert>
        )}
      </SimpleCard>
      <SimpleCard title="Ustawianie awatara">
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={4}>
            <input
              type="file"
              ref={(input) => setFileInput(input)}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              component="label"
              onClick={handleUploadWindow}
              endIcon={<UploadFileIcon />}
            >
              Wybierz plik
            </Button>

            {!avatar && 'Nie wybrano pliku'}
            {avatar && avatar.name}
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              component="label"
              onClick={handleUpload}
              endIcon={<DownloadingIcon />}
            >
              Załaduj plik
            </Button>
            <progress value={progress} max="100" />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Podgląd awatara
            <Avatar src={avatarURL} alt="Awatar" sx={{ mx: 'auto', my: 2 }} />
          </Grid>
        </Grid>
      </SimpleCard>
    </Stack>
  );
};

export default ProfileSettings;
