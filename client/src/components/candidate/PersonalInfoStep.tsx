// src/components/candidate/PersonalInfoStep.tsx

import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { TextField, Grid, Typography, Autocomplete, Box, Button, InputAdornment, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { type ProfileFormInputs } from '../../pages/candidate/CompleteProfilePage';

const locationOptions = ['New Delhi, India', 'Mumbai, India', 'Bangalore, India', 'Pune, India', 'Chennai, India', 'Kolkata, India', 'Hyderabad, India'];

// API functions for phone OTP
const sendPhoneOtp = async (phone: string) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/users/send-phone-otp', { phone }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const verifyPhoneOtp = async (otp: string) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/users/verify-phone-otp', { otp }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const PersonalInfoStep = () => {
  const { control, watch, formState: { errors } } = useFormContext<ProfileFormInputs>();
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otp, setOtp] = useState('');

  const phoneValue = watch('phone'); // Watch the value of the phone field

  const sendOtpMutation = useMutation({
    mutationFn: sendPhoneOtp,
    onSuccess: (data) => {
      toast.success(data.message);
      setOtpSent(true);
    },
    onError: () => {
      toast.error('Failed to send OTP. Please check the number and try again.');
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyPhoneOtp,
    onSuccess: (data) => {
      toast.success(data.message);
      setPhoneVerified(true);
      setOtpSent(false); // Hide the OTP field after success
    },
    onError: () => {
      toast.error('Invalid or expired OTP.');
    }
  });

  const handleSendOtp = () => {
    // Remember to format the phone number to E.164 standard if necessary, e.g., +91...
    sendOtpMutation.mutate(phoneValue);
  };

  const handleVerifyOtp = () => {
    verifyOtpMutation.mutate(otp);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Personal Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                required
                id="phone"
                label="Phone Number (e.g., +91XXXXXXXXXX)"
                fullWidth
                variant="standard"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={phoneVerified || otpSent}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {phoneVerified ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Button onClick={handleSendOtp} disabled={otpSent || !phoneValue || !!errors.phone}>
                          {otpSent ? 'OTP Sent' : 'Verify'}
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {otpSent && !phoneVerified && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Enter OTP"
                variant="standard"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button onClick={handleVerifyOtp} variant="contained" disabled={otp.length !== 6 || verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? <CircularProgress size={24}/> : 'Submit OTP'}
              </Button>
            </Box>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <TextField {...field} required id="address" label="Full Address" fullWidth variant="standard" error={!!errors.address} helperText={errors.address?.message} />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="preferredLocations"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                options={locationOptions}
                value={value || []}
                onChange={(event, newValue) => onChange(newValue)}
                renderInput={(params) => (<TextField {...params} variant="standard" label="Preferred Job Locations" placeholder="Select cities" />)}
              />
            )}
          />
        </Grid>
      </Grid>
    </>
  );
};