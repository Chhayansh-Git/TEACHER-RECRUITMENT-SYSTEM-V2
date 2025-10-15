// src/pages/auth/VerifyOtpPage.tsx

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';
import toast from 'react-hot-toast';

// MUI Components
import { Container, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';

type Inputs = { 
    emailOtp: string;
    phoneOtp: string;
};

const verifyDualOtp = async (data: { email: string; emailOtp: string; phoneOtp: string; }) => {
  const { data: responseData } = await api.post('/auth/verify-otp', data);
  return responseData;
};

const resendOtp = async (data: { email: string }) => {
    const { data: responseData } = await api.post('/auth/resend-otp', data);
    return responseData;
};

export const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { email, phone } = location.state || {};

  const [timer, setTimer] = useState(60);

  useEffect(() => {
      if (!email || !phone) {
          toast.error("Invalid session. Please start registration again.");
          navigate('/register');
      }
      const interval = setInterval(() => {
          setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
  }, [email, phone, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();

  const verificationMutation = useMutation({
    mutationFn: verifyDualOtp,
    onSuccess: (data) => {
      if (data.paymentRequired) {
        toast.success('Verification successful! Please complete the final payment step.');
        navigate('/school-registration-payment', { 
            state: { 
                userId: data.userId,
                email: data.email,
                schoolName: data.schoolName
            }
        });
      } else {
        toast.success('Verification successful! Welcome.');
        dispatch(setCredentials({ userInfo: data, token: data.token }));
        
        if (data.role === 'candidate') {
          navigate('/candidate/complete-profile');
        } else if (data.role === 'school') {
          // Since profile is now complete, navigate to dashboard
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
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
          toast.error(error.response?.data?.message || 'Failed to resend OTPs.');
      }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    verificationMutation.mutate({ email, ...data });
  };

  const handleResend = () => {
      resendMutation.mutate({ email });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
        <Typography component="h1" variant="h5">Complete Verification</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          We've sent verification codes to your email ({email}) and phone ({phone}).
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="emailOtp"
            label="Email Verification Code"
            autoFocus
            {...register('emailOtp', { required: 'Email OTP is required', minLength: 6, maxLength: 6 })}
            error={!!errors.emailOtp}
            helperText={errors.emailOtp?.message || (errors.emailOtp?.type === 'minLength' || errors.emailOtp?.type === 'maxLength') && 'OTP must be 6 digits'}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phoneOtp"
            label="Phone Verification Code"
            {...register('phoneOtp', { required: 'Phone OTP is required', minLength: 6, maxLength: 6 })}
            error={!!errors.phoneOtp}
            helperText={errors.phoneOtp?.message || (errors.phoneOtp?.type === 'minLength' || errors.phoneOtp?.type === 'maxLength') && 'OTP must be 6 digits'}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={verificationMutation.isPending}>
            {verificationMutation.isPending ? <CircularProgress size={24} /> : 'Verify Account'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2">Didn't receive codes?</Typography>
            <Button onClick={handleResend} disabled={timer > 0 || resendMutation.isPending} sx={{ ml: 1 }}>
              Resend {timer > 0 ? `(${timer}s)` : ''}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};