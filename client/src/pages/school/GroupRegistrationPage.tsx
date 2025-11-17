// client/srcsrc/pages/school/GroupRegistrationPage.tsx
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
  Alert,
} from '@mui/material';

type GroupRegistrationInputs = {
  name: string; // This will be the Group Admin's name
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  organizationName: string; // The name of the school group/chain
  termsAndConditions: boolean;
};

const registerGroupAdmin = async (formData: Omit<GroupRegistrationInputs, 'confirmPassword' | 'termsAndConditions'>) => {
  const payload = {
    ...formData,
    role: 'group-admin', // Hardcode the role
  };
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const GroupRegistrationPage = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, watch, formState: { errors } } = useForm<GroupRegistrationInputs>();

  const mutation = useMutation({
    mutationFn: registerGroupAdmin,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/verify-otp', { state: { email: data.email, phone: data.phone } });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed.');
    }
  });

  const onSubmit: SubmitHandler<GroupRegistrationInputs> = data => {
    mutation.mutate(data);
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper sx={{ my: 4, p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          School Group Registration
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Register as an administrator for your school group to manage multiple institutions from a single dashboard.
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Group Info */}
            <Grid item xs={12}><Typography variant="h6">Group Information</Typography></Grid>
            <Grid item xs={12}>
              <Controller 
                name="organizationName" 
                control={control} 
                rules={{ required: 'Your organization\'s name is required' }} 
                render={({ field }) => <TextField {...field} label="School Group / Chain Name" fullWidth error={!!errors.organizationName} helperText={errors.organizationName?.message} />} 
              />
            </Grid>
            
            {/* Admin's Personal Info */}
            <Grid item xs={12} mt={2}><Typography variant="h6">Your Administrator Details</Typography></Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="name" control={control} rules={{ required: 'Your full name is required' }} render={({ field }) => <TextField {...field} label="Your Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="email" control={control} rules={{ required: 'A valid email is required' }} render={({ field }) => <TextField {...field} type="email" label="Your Work Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="phone" control={control} rules={{ required: 'A valid phone number is required' }} render={({ field }) => <TextField {...field} label="Your Phone (for OTP)" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />} />
            </Grid>
            
            {/* Password */}
            <Grid item xs={12} sm={6}><Controller name="password" control={control} rules={{ required: 'Password is required' }} render={({ field }) => <TextField {...field} type="password" label="Create Password" fullWidth error={!!errors.password} helperText={errors.password?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="confirmPassword" control={control} rules={{ required: 'Please confirm password', validate: value => value === watch('password') || 'Passwords do not match' }} render={({ field }) => <TextField {...field} type="password" label="Confirm Password" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />} /></Grid>

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