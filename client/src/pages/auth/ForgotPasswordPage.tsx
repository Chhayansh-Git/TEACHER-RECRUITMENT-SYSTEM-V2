// src/pages/auth/ForgotPasswordPage.tsx

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, Link } from '@mui/material';

type Inputs = { email: string };

const requestPasswordReset = async (data: Inputs) => {
  const { data: responseData } = await api.post('/auth/forgot-password', data);
  return responseData;
};

export const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const mutation = useMutation({ mutationFn: requestPasswordReset });

  const onSubmit: SubmitHandler<Inputs> = data => mutation.mutate(data);

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
        <Typography component="h1" variant="h5">Forgot Your Password?</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          No problem. Just enter your email address below and we'll send you a link to reset it.
        </Typography>
        {mutation.isSuccess ? (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            If an account with that email exists, a reset link has been sent.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            {mutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>An error occurred. Please try again.</Alert>
            )}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={mutation.isPending}>
              {mutation.isPending ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
          </Box>
        )}
        <Link component={RouterLink} to="/login" variant="body2">Back to Login</Link>
      </Box>
    </Container>
  );
};