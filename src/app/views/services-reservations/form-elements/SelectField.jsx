import React, { useState } from 'react';
import { Field, useFormikContext, ErrorMessage } from 'formik';
import { Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';

const SelectField = ({ name, label, options, onChange }) => {
  const { setFieldValue, touched, errors, values } = useFormikContext();
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setValue(selectedValue);
    setFieldValue(name, selectedValue);

    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Field
        as={Select}
        labelId={`${name}-label`}
        label={label}
        name={name}
        fullWidth
        onChange={handleChange}
        value={values[name]}
        error={Boolean(errors[name] && touched[name])}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Field>
      <FormHelperText error={Boolean(errors[name] && touched[name])}>
        <ErrorMessage name={name} />
      </FormHelperText>
    </FormControl>
  );
};

export default SelectField;
