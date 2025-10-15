// src/pages/auth/SchoolRegistrationPage.tsx

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Link,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';

// Predefined options for dropdowns
const schoolUpToOptions = ['V', 'VIII', 'X', 'XII'];
const boardOptions = ['CBSE', 'ICSE', 'IB', 'State Board', 'Other'];

type SchoolRegistrationInputs = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  principalName: string;
  directorName: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  contactNumber: string;
  whatsappNumber?: string;
  website?: string;
  schoolUpTo: string;
  board: string;
  cbseAffiliationNumber?: string;
  studentStrength?: number;
  termsAndConditions: boolean;
};

const registerSchool = async (formData: Omit<SchoolRegistrationInputs, 'confirmPassword' | 'termsAndConditions'>) => {
  // We need to flatten the data for the backend registration endpoint
  const payload = {
    ...formData,
    role: 'school', // Hardcode the role
  };
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const SchoolRegistrationPage = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, watch, formState: { errors } } = useForm<SchoolRegistrationInputs>();

  const mutation = useMutation({
    mutationFn: registerSchool,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/verify-otp', { state: { email: data.email, phone: data.phone } });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed.');
    }
  });

  const onSubmit: SubmitHandler<SchoolRegistrationInputs> = data => {
    mutation.mutate(data);
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper sx={{ my: 4, p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          School Registration
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Basic Info */}
            <Grid item xs={12}><Typography variant="h6">Basic Information</Typography></Grid>
            <Grid item xs={12}><Controller name="name" control={control} rules={{ required: 'School Name is required' }} render={({ field }) => <TextField {...field} label="School Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="email" control={control} rules={{ required: 'Email is required' }} render={({ field }) => <TextField {...field} type="email" label="Official Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="phone" control={control} rules={{ required: 'Official Phone Number is required' }} render={({ field }) => <TextField {...field} label="Official Phone (for OTP)" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="password" control={control} rules={{ required: 'Password is required' }} render={({ field }) => <TextField {...field} type="password" label="Password" fullWidth error={!!errors.password} helperText={errors.password?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="confirmPassword" control={control} rules={{ required: 'Please confirm password', validate: value => value === watch('password') || 'Passwords do not match' }} render={({ field }) => <TextField {...field} type="password" label="Confirm Password" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />} /></Grid>

            {/* Detailed Profile Info (from SRS) */}
            <Grid item xs={12} mt={2}><Typography variant="h6">School Details</Typography></Grid>
            <Grid item xs={12}><Controller name="address.street" control={control} rules={{ required: 'Street Address is required' }} render={({ field }) => <TextField {...field} label="Street Address" fullWidth error={!!errors.address?.street} helperText={errors.address?.street?.message} />} /></Grid>
            <Grid item xs={12} sm={4}><Controller name="address.city" control={control} rules={{ required: 'City is required' }} render={({ field }) => <TextField {...field} label="City" fullWidth error={!!errors.address?.city} helperText={errors.address?.city?.message} />} /></Grid>
            <Grid item xs={12} sm={4}><Controller name="address.state" control={control} rules={{ required: 'State is required' }} render={({ field }) => <TextField {...field} label="State" fullWidth error={!!errors.address?.state} helperText={errors.address?.state?.message} />} /></Grid>
            <Grid item xs={12} sm={4}><Controller name="address.pinCode" control={control} rules={{ required: 'PIN Code is required' }} render={({ field }) => <TextField {...field} label="PIN Code" fullWidth error={!!errors.address?.pinCode} helperText={errors.address?.pinCode?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="contactNumber" control={control} rules={{ required: 'Contact Number is required' }} render={({ field }) => <TextField {...field} label="Contact Number" fullWidth error={!!errors.contactNumber} helperText={errors.contactNumber?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="whatsappNumber" control={control} render={({ field }) => <TextField {...field} label="WhatsApp Number (Optional)" fullWidth />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="principalName" control={control} rules={{ required: 'Principal Name is required' }} render={({ field }) => <TextField {...field} label="Principal Name" fullWidth error={!!errors.principalName} helperText={errors.principalName?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="directorName" control={control} rules={{ required: 'Director Name is required' }} render={({ field }) => <TextField {...field} label="Director Name" fullWidth error={!!errors.directorName} helperText={errors.directorName?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="website" control={control} render={({ field }) => <TextField {...field} label="Website (Optional)" fullWidth />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="studentStrength" control={control} render={({ field }) => <TextField {...field} type="number" label="Student Strength (Optional)" fullWidth />} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.schoolUpTo}><InputLabel>School Up To</InputLabel><Controller name="schoolUpTo" control={control} rules={{ required: 'This field is required' }} render={({ field }) => <Select {...field} label="School Up To">{schoolUpToOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select>} /></FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.board}><InputLabel>Board</InputLabel><Controller name="board" control={control} rules={{ required: 'This field is required' }} render={({ field }) => <Select {...field} label="Board">{boardOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select>} /></FormControl>
            </Grid>
            <Grid item xs={12}><Controller name="cbseAffiliationNumber" control={control} render={({ field }) => <TextField {...field} label="CBSE Affiliation No. (if applicable)" fullWidth />} /></Grid>

            <Grid item xs={12}>
              <FormControl error={!!errors.termsAndConditions}>
                <Controller
                  name="termsAndConditions"
                  control={control}
                  rules={{ required: 'You must agree to the terms and conditions' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value || false} />}
                      label="I agree to the Terms and Conditions"
                    />
                  )}
                />
                {errors.termsAndConditions && <FormHelperText>{errors.termsAndConditions.message}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {mutation.isError && <Grid item xs={12}><Alert severity="error">{(mutation.error as any).response?.data?.message || 'Registration failed'}</Alert></Grid>}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth size="large" disabled={mutation.isPending}>
                {mutation.isPending ? <CircularProgress size={24} /> : 'Register and Proceed to Verification'}
              </Button>
            </Grid>

            <Grid item xs={12} container justifyContent="center">
                <Link component={RouterLink} to="/login" variant="body2">Already have an account? Sign in</Link>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};