// src/pages/auth/ResetPasswordPage.tsx

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

// MUI Components
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';

type Inputs = { password: string, confirmPassword: string };

const resetPassword = async (data: { password: string, token: string }) => {
  const { data: responseData } = await api.patch(`/auth/reset-password/${data.token}`, { password: data.password });
  return responseData;
};

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      // On success, we can show a success message and then redirect
      setTimeout(() => navigate('/login'), 3000);
    }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    if (token) {
      mutation.mutate({ password: data.password, token });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
        <Typography component="h1" variant="h5">Reset Your Password</Typography>
        {mutation.isSuccess ? (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            Password reset successfully! Redirecting to login...
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm New Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: value => value === watch('password') || 'Passwords do not match'
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
            {mutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>Token is invalid or has expired.</Alert>
            )}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={mutation.isPending}>
              {mutation.isPending ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};