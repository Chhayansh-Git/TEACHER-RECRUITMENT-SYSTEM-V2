// src/pages/auth/RegistrationPage.tsx

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Link,
  Avatar,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

type Inputs = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const registerCandidate = async (userData: Omit<Inputs, 'confirmPassword'>) => {
  const payload = { ...userData, role: 'candidate' };
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const RegistrationPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerCandidate,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/verify-otp', { state: { email: data.email, phone: data.phone } });
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Registration failed.');
    }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    mutation.mutate(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Candidate Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 3 }}
        >
          <TextField
            required
            fullWidth
            id="name"
            label="Full Name"
            autoFocus
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message as string}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
            })}
            error={!!errors.email}
            helperText={errors.email?.message as string}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number (for OTP)"
            {...register('phone', { required: 'Phone number is required' })}
            error={!!errors.phone}
            helperText={errors.phone?.message as string}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={!!errors.password}
            helperText={errors.password?.message as string}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === watch('password') || 'Passwords do not match',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message as string}
          />

          {mutation.isError && (
             <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {(mutation.error as any).response?.data?.message || 'Registration failed'}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Register & Verify'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};