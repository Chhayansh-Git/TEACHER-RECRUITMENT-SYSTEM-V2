// src/components/candidate/ExperienceStep.tsx

import { TextField, Grid, Typography, Button, IconButton, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormContext, useFieldArray, Controller, get } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { ProfileFormInputs } from '../../pages/candidate/CompleteProfilePage';

// Predefined, common job titles for consistency
const jobTitleOptions = [
  'Primary School Teacher',
  'Secondary School Teacher',
  'Subject Matter Expert (SME)',
  'Head of Department (HOD)',
  'Vice Principal',
  'Principal',
  'Special Education Teacher',
  'Assistant Teacher',
  'Tutor',
  'Other',
];

export const ExperienceStep = () => {
  const { control, formState: { errors } } = useFormContext<ProfileFormInputs>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Work Experience
      </Typography>

      {fields.map((item, index) => {
        const jobTitleError = get(errors, `experience.${index}.jobTitle`);
        const companyError = get(errors, `experience.${index}.company`);
        const startDateError = get(errors, `experience.${index}.startDate`);

        return (
          <Box key={item.id} sx={{ mb: 3, p: 2, border: '1px dashed grey', borderRadius: 2, position: 'relative' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="standard" error={!!jobTitleError}>
                  <InputLabel id={`job-title-label-${index}`}>Job Title</InputLabel>
                  <Controller
                    name={`experience.${index}.jobTitle`}
                    control={control}
                    rules={{ required: 'Job title is required' }}
                    render={({ field }) => (
                      <Select {...field} labelId={`job-title-label-${index}`} label="Job Title">
                        {jobTitleOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                    )}
                  />
                   {jobTitleError && <Typography variant="caption" color="error">{jobTitleError.message}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`experience.${index}.company`}
                  control={control}
                  rules={{ required: 'School/Company name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="School / Company"
                      fullWidth
                      variant="standard"
                      error={!!companyError}
                      helperText={companyError?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`experience.${index}.startDate`}
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="standard"
                      error={!!startDateError}
                      helperText={startDateError?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`experience.${index}.endDate`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date (optional)"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="standard"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                 <Controller
                  name={`experience.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description (optional)"
                      multiline
                      rows={3}
                      fullWidth
                      variant="standard"
                    />
                  )}
                />
              </Grid>
            </Grid>
            <IconButton
              aria-label="delete"
              onClick={() => remove(index)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteOutlineIcon color="error" />
            </IconButton>
          </Box>
        );
      })}

      <Button
        type="button"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => append({ jobTitle: '', company: '', startDate: '', endDate: '', description: '' })}
      >
        Add Experience
      </Button>
    </>
  );
};