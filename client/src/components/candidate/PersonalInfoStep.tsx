// src/components/candidate/PersonalInfoStep.tsx

import { useState, useEffect } from 'react';
import { useFormContext, Controller, get } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../hooks/redux.hooks';

// MUI Components
import { TextField, Grid, Typography, Autocomplete, Box, Button, InputAdornment, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { type ProfileFormInputs } from '../../pages/candidate/EditProfilePage';

const locationOptions = ['New Delhi, India', 'Mumbai, India', 'Bangalore, India', 'Pune, India', 'Chennai, India', 'Kolkata, India', 'Hyderabad, India'];

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
  const { userInfo } = useAppSelector(state => state.auth);
  const { control, watch, formState: { errors }, setValue } = useFormContext<ProfileFormInputs>();
  
  // Initialize phoneVerified state from Redux store
  const [phoneVerified, setPhoneVerified] = useState(userInfo?.isPhoneVerified || false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const phoneValue = watch('phone');

  // Pre-populate the phone number from Redux store on initial render
  useEffect(() => {
    if (userInfo?.phone) {
      setValue('phone', userInfo.phone);
    }
  }, [userInfo, setValue]);


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
      setOtpSent(false);
    },
    onError: () => {
      toast.error('Invalid or expired OTP.');
    }
  });

  const handleSendOtp = () => {
    sendOtpMutation.mutate(phoneValue);
  };

  const handleVerifyOtp = () => {
    verifyOtpMutation.mutate(otp);
  };
  
  const streetError = get(errors, 'address.street');
  const cityError = get(errors, 'address.city');
  const stateError = get(errors, 'address.state');
  const pinCodeError = get(errors, 'address.pinCode');

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
                helperText={errors.phone?.message as string}
                // --- THIS IS THE KEY CHANGE ---
                // Disable the field completely if phone is already verified
                disabled={phoneVerified || otpSent}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {phoneVerified ? (
                        <Box sx={{display: 'flex', alignItems: 'center', color: 'success.main'}}>
                           <CheckCircleIcon fontSize="small" sx={{mr: 1}}/>
                           <Typography variant="body2">Verified</Typography>
                        </Box>
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
                name="address.street"
                control={control}
                render={({ field }) => <TextField {...field} label="Street Address" fullWidth variant="standard" error={!!streetError} helperText={streetError?.message as string} />}
            />
        </Grid>
        <Grid item xs={12} sm={4}>
            <Controller
                name="address.city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => <TextField {...field} label="City" fullWidth variant="standard" error={!!cityError} helperText={cityError?.message as string} />}
            />
        </Grid>
        <Grid item xs={12} sm={4}>
            <Controller
                name="address.state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => <TextField {...field} label="State / Province" fullWidth variant="standard" error={!!stateError} helperText={stateError?.message as string} />}
            />
        </Grid>
        <Grid item xs={12} sm={4}>
            <Controller
                name="address.pinCode"
                control={control}
                rules={{ required: 'PIN Code is required' }}
                render={({ field }) => <TextField {...field} label="PIN Code" fullWidth variant="standard" error={!!pinCodeError} helperText={pinCodeError?.message as string} />}
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