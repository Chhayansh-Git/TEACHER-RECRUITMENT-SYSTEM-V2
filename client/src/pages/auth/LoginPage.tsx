// src/pages/auth/LoginPage.tsx

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';
import toast from 'react-hot-toast';

// MUI Components
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Link,
  Avatar,
  Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

type Inputs = {
  email: string;
  password: string;
};

const loginUser = async (credentials: Inputs) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setCredentials({ userInfo: data, token: data.token }));
      navigate('/dashboard'); 
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Invalid email or password');
    }
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
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
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email address",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message as string}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message as string}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
        
        {/* --- THIS IS THE FIX --- */}
        <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
        <Button component={RouterLink} to="/" fullWidth>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};