// src/components/candidate/PersonalInfoStep.tsx

import { TextField, Typography, Autocomplete, Stack, Box } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProfileFormInputs } from '../../pages/candidate/CompleteProfilePage';

// In a real app, this would come from a database or a constants file
const locationOptions = ['New Delhi, India', 'Mumbai, India', 'Bangalore, India', 'Pune, India', 'Chennai, India', 'Kolkata, India', 'Hyderabad, India'];

export const PersonalInfoStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProfileFormInputs>();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Personal Details
      </Typography>
      <Stack spacing={3}>
        <Box>
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                required
                id="phone"
                label="Phone Number"
                fullWidth
                variant="standard"
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="address"
            control={control}
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                required
                id="address"
                label="Full Address"
                fullWidth
                variant="standard"
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="preferredLocations"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                options={locationOptions}
                value={value || []}
                onChange={(_, newValue) => onChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Preferred Job Locations"
                    placeholder="Select cities"
                  />
                )}
              />
            )}
          />
        </Box>
      </Stack>
    </>
  );
};