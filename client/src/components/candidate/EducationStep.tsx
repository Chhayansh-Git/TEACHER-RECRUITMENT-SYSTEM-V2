// src/components/candidate/EducationStep.tsx

import { TextField, Grid, Typography, Button, IconButton, Box, FormControl, InputLabel, Select, MenuItem, Autocomplete, Tooltip } from '@mui/material';
import { useFormContext, useFieldArray, Controller, get } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { type ProfileFormInputs } from '../../pages/candidate/CompleteProfilePage';

// Predefined degree options
const degreeOptions = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor of Arts (B.A.)',
  'Bachelor of Science (B.S.)',
  'Bachelor of Education (B.Ed)',
  'Master of Arts (M.A.)',
  'Master of Science (M.S.)',
  'Master of Education (M.Ed)',
  'Doctor of Philosophy (PhD)',
  'Other',
];

// In a real application, this list would be extensive and likely fetched from the backend
const institutionOptions = [
    'University of Delhi',
    'Jawaharlal Nehru University',
    'Indian Institute of Technology Bombay',
    'Indian Institute of Technology Delhi',
    'University of Mumbai',
    'University of Calcutta',
];

export const EducationStep = () => {
  const { control, formState: { errors } } = useFormContext<ProfileFormInputs>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Educational Background
      </Typography>

      {fields.map((item, index) => {
        const degreeError = get(errors, `education.${index}.degree`);
        const institutionError = get(errors, `education.${index}.institution`);
        const startYearError = get(errors, `education.${index}.startYear`);
        const endYearError = get(errors, `education.${index}.endYear`);

        return (
          <Box key={item.id} sx={{ mb: 3, p: 2, border: '1px dashed grey', borderRadius: 2, position: 'relative' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="standard" error={!!degreeError}>
                  <InputLabel id={`degree-label-${index}`}>Degree</InputLabel>
                  <Controller
                    name={`education.${index}.degree`}
                    control={control}
                    rules={{ required: 'Degree is required' }}
                    defaultValue=""
                    render={({ field }) => (
                      <Select {...field} labelId={`degree-label-${index}`} label="Degree">
                        {degreeOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                    )}
                  />
                  {degreeError && <Typography variant="caption" color="error">{degreeError.message}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name={`education.${index}.institution`}
                  control={control}
                  rules={{ required: 'Institution is required' }}
                  defaultValue=""
                  render={({ field }) => (
                    <Autocomplete
                        {...field}
                        freeSolo
                        options={institutionOptions}
                        onChange={(e, value) => field.onChange(value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Institution Name"
                                variant="standard"
                                error={!!institutionError}
                                helperText={institutionError?.message as string}
                            />
                        )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`education.${index}.startYear`}
                  control={control}
                  rules={{ required: 'Start year is required' }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Year"
                      type="number"
                      fullWidth
                      variant="standard"
                      error={!!startYearError}
                      helperText={startYearError ? (startYearError.message as string) : "The year you started this course."}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`education.${index}.endYear`}
                  control={control}
                  rules={{ required: 'End year is required' }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Year"
                      type="number"
                      fullWidth
                      variant="standard"
                      error={!!endYearError}
                      helperText={endYearError ? (endYearError.message as string) : "The year you completed or expect to complete."}
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
        onClick={() => append({ degree: '', institution: '', startYear: 0, endYear: 0 })}
      >
        Add Education
      </Button>
    </>
  );
};