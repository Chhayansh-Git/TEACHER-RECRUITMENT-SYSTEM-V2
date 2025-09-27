// src/pages/auth/RegistrationPage.tsx

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';

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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Define types for form inputs
type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'candidate' | 'school';
};

// API call function
const registerUser = async (userData: Omit<Inputs, 'confirmPassword'>) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const RegistrationPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ defaultValues: { role: 'candidate' }});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setCredentials({ userInfo: data, token: data.token }));
      navigate('/dashboard');
    },
  });

  const onSubmit: SubmitHandler<Inputs> = ({ name, email, password, role }) => {
    mutation.mutate({ name, email, password, role });
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
          Sign Up
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
            helperText={errors.name?.message}
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
            helperText={errors.email?.message}
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
            helperText={errors.password?.message}
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
            helperText={errors.confirmPassword?.message}
          />
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">I am a...</FormLabel>
            <RadioGroup row defaultValue="candidate">
              <FormControlLabel value="candidate" control={<Radio {...register('role')} />} label="Candidate" />
              <FormControlLabel value="school" control={<Radio {...register('role')} />} label="School" />
            </RadioGroup>
          </FormControl>
          {mutation.isError && (
             <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {/* @ts-ignore */}
                {mutation.error.response?.data?.message || 'Registration failed'}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid>
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