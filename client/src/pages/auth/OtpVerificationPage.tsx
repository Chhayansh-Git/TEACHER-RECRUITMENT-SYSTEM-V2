// src/pages/auth/OtpVerificationPage.tsx

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';
import toast from 'react-hot-toast';

// MUI Components
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, Link } from '@mui/material';

type Inputs = { otp: string };

const verifyOtp = async (data: { email: string; otp: string }) => {
  const { data: responseData } = await api.post('/auth/verify-email-otp', data);
  return responseData;
};

const resendOtp = async (data: { email: string }) => {
    const { data: responseData } = await api.post('/auth/resend-email-otp', data);
    return responseData;
};

export const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const email = location.state?.email;

  const [timer, setTimer] = useState(60);

  useEffect(() => {
      if (!email) {
          // If there's no email in state, user probably landed here directly. Redirect.
          navigate('/register');
      }
      const interval = setInterval(() => {
          setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
  }, [email, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();

  const verificationMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      toast.success('Verification successful! Welcome.');
      dispatch(setCredentials({ userInfo: data, token: data.token }));

      // Navigate to the correct onboarding page
      if (data.role === 'candidate') {
        navigate('/candidate/complete-profile');
      } else if (data.role === 'school') {
        navigate('/school/profile');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Verification failed.');
    }
  });

  const resendMutation = useMutation({
      mutationFn: resendOtp,
      onSuccess: (data) => {
          toast.success(data.message);
          setTimer(60); // Reset timer
      },
      onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to resend OTP.');
      }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    verificationMutation.mutate({ email, otp: data.otp });
  };

  const handleResend = () => {
      resendMutation.mutate({ email });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
        <Typography component="h1" variant="h5">Verify Your Email</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          We've sent a 6-digit code to {email}. Please enter it below.
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="otp"
            label="Verification Code"
            autoFocus
            {...register('otp', { required: 'OTP is required', minLength: 6, maxLength: 6 })}
            error={!!errors.otp}
            helperText={errors.otp?.message || (errors.otp?.type === 'minLength' || errors.otp?.type === 'maxLength') && 'OTP must be 6 digits'}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={verificationMutation.isPending}>
            {verificationMutation.isPending ? <CircularProgress size={24} /> : 'Verify Account'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2">Didn't receive a code?</Typography>
            <Button onClick={handleResend} disabled={timer > 0 || resendMutation.isPending} sx={{ ml: 1 }}>
              Resend {timer > 0 ? `(${timer}s)` : ''}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};