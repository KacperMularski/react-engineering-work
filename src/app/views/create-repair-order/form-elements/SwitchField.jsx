import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { Field, useFormikContext } from 'formik';

function SwitchField({ name, onChange }) {
  const { setFieldValue, values } = useFormikContext();

  const handleChange = (event) => {
    const { checked } = event.target;
    setFieldValue(name, checked);
    if (onChange) {
      onChange(checked);
    }
  };

  return (
    <FormControlLabel
      control={
        <Field
          as={Switch}
          name={name}
          color="warning"
          onChange={handleChange}
          checked={values[name]}
        />
      }
    />
  );
}

export default SwitchField;
