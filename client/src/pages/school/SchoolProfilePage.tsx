// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/pages/school/SchoolProfilePage.tsx
import { useEffect, useState, useRef } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';
import toast from 'react-hot-toast';

// MUI Components
import { Paper, Typography, TextField, Button, Grid, CircularProgress, Alert, Box, Avatar, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const API_BASE_URL = 'http://localhost:5001';

type SchoolProfileInputs = {
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  principalName: string;
  directorName: string;
  cbseAffiliationNumber?: string;
  studentStrength?: number;
  about?: string;
};

const fetchSchoolProfile = async (): Promise<SchoolProfileInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/school/profile', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateSchoolProfile = async (profileData: SchoolProfileInputs) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put('/school/profile', profileData, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const uploadPicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem('token');
  const { data } = await api.put('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const SchoolProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { userInfo, token } = useAppSelector((state) => state.auth);
  const [preview, setPreview] = useState<string | null>(userInfo?.profilePictureUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SchoolProfileInputs>();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: fetchSchoolProfile,
  });

  useEffect(() => {
    if (profileData) {
      reset(profileData);
    }
  }, [profileData, reset]);
  
  const pictureMutation = useMutation({ mutationFn: uploadPicture });
  const profileMutation = useMutation({ mutationFn: updateSchoolProfile });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<SchoolProfileInputs> = async (formData) => {
    let newPictureUrl = userInfo?.profilePictureUrl;

    if (fileInputRef.current?.files?.[0]) {
      try {
        const uploadResult = await pictureMutation.mutateAsync(fileInputRef.current.files[0]);
        newPictureUrl = uploadResult.profilePictureUrl;
      } catch (error) {
        toast.error("Picture upload failed.");
        return;
      }
    }

    try {
        await profileMutation.mutateAsync(formData);
    
        if (userInfo && token) {
            const updatedUserInfo = { ...userInfo, profilePictureUrl: newPictureUrl };
            dispatch(setCredentials({ userInfo: updatedUserInfo, token }));
        }
        queryClient.invalidateQueries({ queryKey: ['schoolProfile'] });
        toast.success("Profile saved successfully!");
        navigate('/school/profile'); // Navigate back to the view page on success
    } catch (error) {
        toast.error("Failed to update profile.");
    }
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4 }}>
      {/* --- HEADER CLEANUP --- */}
      <Typography variant="h4" gutterBottom>
        Manage School Profile
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="school-logo-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <label htmlFor="school-logo-upload">
          <IconButton color="primary" aria-label="upload picture" component="span">
            <Avatar src={preview ? (preview.startsWith('blob:') ? preview : `${API_BASE_URL}${preview}`) : undefined} sx={{ width: 120, height: 120, cursor: 'pointer' }}>
               {!preview && <PhotoCamera sx={{ width: 50, height: 50 }} />}
            </Avatar>
          </IconButton>
        </label>
        <Button onClick={() => fileInputRef.current?.click()} sx={{mt: 1}}>Upload School Logo</Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller name="principalName" control={control} rules={{ required: 'Principal name is required' }} render={({ field }) => <TextField {...field} label="Principal Name" fullWidth error={!!errors.principalName} helperText={errors.principalName?.message} />} />
          </Grid>
           <Grid item xs={12}>
            <Controller name="directorName" control={control} rules={{ required: 'Director name is required' }} render={({ field }) => <TextField {...field} label="Director Name" fullWidth error={!!errors.directorName} helperText={errors.directorName?.message} />} />
          </Grid>
          
          <Grid item xs={12}>
            <Controller name="address.street" control={control} rules={{ required: 'Street Address is required' }} render={({ field }) => <TextField {...field} label="Street Address" fullWidth error={!!errors.address?.street} helperText={errors.address?.street?.message} />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="address.city" control={control} rules={{ required: 'City is required' }} render={({ field }) => <TextField {...field} label="City" fullWidth error={!!errors.address?.city} helperText={errors.address?.city?.message} />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="address.state" control={control} rules={{ required: 'State is required' }} render={({ field }) => <TextField {...field} label="State" fullWidth error={!!errors.address?.state} helperText={errors.address?.state?.message} />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="address.pinCode" control={control} rules={{ required: 'PIN Code is required' }} render={({ field }) => <TextField {...field} label="PIN Code" fullWidth error={!!errors.address?.pinCode} helperText={errors.address?.pinCode?.message} />} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller name="cbseAffiliationNumber" control={control} render={({ field }) => <TextField {...field} label="CBSE Affiliation No. (Optional)" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="studentStrength" control={control} render={({ field }) => <TextField {...field} label="Total Student Strength (Optional)" type="number" fullWidth />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="about" control={control} render={({ field }) => <TextField {...field} label="About the School (Optional)" multiline rows={4} fullWidth />} />
          </Grid>
          {(profileMutation.isError || pictureMutation.isError) && (
            <Grid item xs={12}><Alert severity="error">Failed to update profile. Please try again.</Alert></Grid>
          )}

          {/* --- ACTION BUTTONS WITH CANCEL BUTTON --- */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={profileMutation.isPending || pictureMutation.isPending}>
                {(profileMutation.isPending || pictureMutation.isPending) ? <CircularProgress size={24} /> : 'Save Profile'}
                </Button>
                <Button variant="outlined" component={RouterLink} to="/school/profile">
                    Cancel
                </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};