import React, { useState } from 'react';
import { Autocomplete, FormHelperText } from '@mui/material';
import { Field, useFormikContext, ErrorMessage } from 'formik';
import { TextField } from 'formik-material-ui';

function AutocompleteField({ name, label, options, onChange }) {
  const { setFieldValue, touched, errors } = useFormikContext();
  const [value, setValue] = useState('');

  const handleChange = (_, selectedOption) => {
    const selectedValue = selectedOption !== null ? selectedOption : ''; // Sprawdź, czy selectedOption nie jest null    console.log('Selected value:', selectedValue);
    setValue(selectedValue);
    setFieldValue(name, selectedValue);

    // Dodaj wywołanie funkcji onChange, jeśli została przekazana
    if (onChange) {
      onChange(selectedValue);
    }
  };
  return (
    <>
      <Autocomplete
        id={name}
        options={options}
        onChange={handleChange}
        value={useFormikContext().values[name] || null}
        renderInput={(params) => (
          <Field
            component={TextField}
            {...params}
            name={name}
            label={label}
            variant="outlined"
            fullWidth
          />
        )}
        error={Boolean(errors[name] && touched[name])}
      />
    </>
  );
}

export default AutocompleteField;
