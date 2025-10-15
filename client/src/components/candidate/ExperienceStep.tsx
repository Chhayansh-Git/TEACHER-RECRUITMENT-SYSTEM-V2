// src/components/candidate/ExperienceStep.tsx

import { TextField, Grid, Typography, Button, IconButton, Box, FormControl, InputLabel, Select, MenuItem, Autocomplete } from '@mui/material';
import { useFormContext, useFieldArray, Controller, get } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { type ProfileFormInputs } from '../../pages/candidate/EditProfilePage';

// ... (jobTitleOptions and companyOptions remain the same)
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

const companyOptions = [
    'Delhi Public School',
    'Kendriya Vidyalaya',
    'Ryan International School',
    'Podar International School',
    'Amity International School',
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
        // Safely get nested address errors
        const companyCityError = get(errors, `experience.${index}.companyAddress.city`);
        const companyStateError = get(errors, `experience.${index}.companyAddress.state`);
        const companyPinCodeError = get(errors, `experience.${index}.companyAddress.pinCode`);

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
                    defaultValue=""
                    render={({ field }) => (
                      <Select {...field} labelId={`job-title-label-${index}`} label="Job Title">
                        {jobTitleOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                    )}
                  />
                   {jobTitleError && <Typography variant="caption" color="error">{jobTitleError.message as string}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`experience.${index}.company`}
                  control={control}
                  rules={{ required: 'School/Company name is required' }}
                  defaultValue=""
                  render={({ field }) => (
                    <Autocomplete
                        {...field}
                        freeSolo
                        options={companyOptions}
                        onChange={(e, value) => field.onChange(value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="School / Company Name"
                                variant="standard"
                                error={!!companyError}
                                helperText={companyError ? (companyError.message as string) : "Select a school or type a new one."}
                            />
                        )}
                    />
                  )}
                />
              </Grid>
              
              {/* --- NEW COMPANY ADDRESS FIELDS --- */}
                <Grid item xs={12} sm={4}>
                    <Controller
                        name={`experience.${index}.companyAddress.city`}
                        control={control}
                        rules={{ required: 'City is required' }}
                        render={({ field }) => <TextField {...field} label="City" fullWidth variant="standard" error={!!companyCityError} helperText={companyCityError?.message} />}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Controller
                        name={`experience.${index}.companyAddress.state`}
                        control={control}
                        rules={{ required: 'State is required' }}
                        render={({ field }) => <TextField {...field} label="State / Province" fullWidth variant="standard" error={!!companyStateError} helperText={companyStateError?.message} />}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Controller
                        name={`experience.${index}.companyAddress.pinCode`}
                        control={control}
                        rules={{ required: 'PIN Code is required' }}
                        render={({ field }) => <TextField {...field} label="PIN Code" fullWidth variant="standard" error={!!companyPinCodeError} helperText={companyPinCodeError?.message} />}
                    />
                </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name={`experience.${index}.startDate`}
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="standard"
                      error={!!startDateError}
                      helperText={startDateError?.message as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`experience.${index}.endDate`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      variant="standard"
                      helperText="Leave blank if this is your current role."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                 <Controller
                  name={`experience.${index}.description`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Key Responsibilities (Optional)"
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
        onClick={() => append({ 
            jobTitle: '', 
            company: '', 
            companyAddress: { street: '', city: '', state: '', pinCode: '' },
            startDate: '', 
            endDate: '', 
            description: '' 
        })}
      >
        Add Experience
      </Button>
    </>
  );
};