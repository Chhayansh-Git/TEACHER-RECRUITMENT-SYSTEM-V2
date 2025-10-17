// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/pages/school/PostRequirementPage.tsx
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Box,
} from '@mui/material';

// ... (type definitions and options remain the same)
type RequirementFormInputs = {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  salary?: number;
  experienceRequired: string;
  qualifications: string[];
  benefits: string[];
};

const experienceOptions = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];
const qualificationOptions = ['B.Ed', 'M.Ed', 'PhD', 'TET Qualified', 'CTET Qualified'];
const benefitOptions = ['Health Insurance', 'Provident Fund (PF)', 'Paid Time Off', 'Maternity Leave'];


const postRequirement = async (data: RequirementFormInputs) => {
  const token = localStorage.getItem('token');
  const { data: responseData } = await api.post('/requirements', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return responseData;
};

export const PostRequirementPage = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm<RequirementFormInputs>({
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      gradeLevel: '',
      employmentType: 'Full-time',
      location: '',
      salary: undefined,
      experienceRequired: '',
      qualifications: [],
      benefits: [],
    },
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: postRequirement,
    onSuccess: () => {
      navigate('/school/requirements');
    },
  });

  const onSubmit: SubmitHandler<RequirementFormInputs> = data => {
    mutation.mutate(data);
  };

  const isSubmitting = mutation.status === 'pending';

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Post a New Job Requirement</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* ... (All the form fields remain exactly the same) ... */}
          <Box>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Job title is required' }}
              render={({ field }) => (
                <TextField {...field} label="Job Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <TextField {...field} label="Job Description" multiline rows={4} fullWidth error={!!errors.description} helperText={errors.description?.message} />
              )}
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box flex={1}>
              <Controller
                name="subject"
                control={control}
                rules={{ required: 'Subject is required' }}
                render={({ field }) => (
                  <TextField {...field} label="Subject (e.g., Mathematics)" fullWidth error={!!errors.subject} helperText={errors.subject?.message} />
                )}
              />
            </Box>

            <Box flex={1}>
              <Controller
                name="gradeLevel"
                control={control}
                rules={{ required: 'Grade level is required' }}
                render={({ field }) => (
                  <TextField {...field} label="Grade Level (e.g., 9-12)" fullWidth error={!!errors.gradeLevel} helperText={errors.gradeLevel?.message} />
                )}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box flex={1}>
              <FormControl fullWidth error={!!errors.employmentType}>
                <InputLabel id="employment-type-label">Employment Type</InputLabel>
                <Controller
                  name="employmentType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} labelId="employment-type-label" label="Employment Type">
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Box>

            <Box flex={1}>
              <FormControl fullWidth error={!!errors.experienceRequired}>
                <InputLabel id="experience-label">Experience Required</InputLabel>
                <Controller
                  name="experienceRequired"
                  control={control}
                  rules={{ required: 'Experience is required' }}
                  render={({ field }) => (
                    <Select {...field} labelId="experience-label" label="Experience Required">
                      {experienceOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box flex={1}>
              <Controller
                name="location"
                control={control}
                rules={{ required: 'Location is required' }}
                render={({ field }) => (
                  <TextField {...field} label="Location (e.g., City, State)" fullWidth error={!!errors.location} helperText={errors.location?.message} />
                )}
              />
            </Box>

            <Box flex={1}>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Salary (Annual, optional)" type="number" fullWidth />
                )}
              />
            </Box>
          </Stack>

          <Box>
            <Controller
              name="qualifications"
              control={control}
              rules={{ validate: v => Array.isArray(v) && v.length > 0 || 'At least one qualification is required' }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={qualificationOptions}
                  value={Array.isArray(value) ? value : []}
                  onChange={(_, newValue) => onChange(newValue)}
                  renderTags={(val, getTagProps) => val.map((option, index) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} key={String(option)}/>))}
                  renderInput={(params) => (<TextField {...params} label="Required Qualifications" placeholder="Select or type qualifications" error={!!errors.qualifications} helperText={errors.qualifications?.message} />)}
                />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="benefits"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={benefitOptions}
                  value={Array.isArray(value) ? value : []}
                  onChange={(_, newValue) => onChange(newValue)}
                  renderTags={(val, getTagProps) => val.map((option, index) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} key={String(option)}/>))}
                  renderInput={(params) => (<TextField {...params} label="Benefits (Optional)" placeholder="Select or type benefits" />)}
                />
              )}
            />
          </Box>


          {mutation.status === 'error' && (
            <Box>
              <Alert severity="error">Failed to post requirement. Please try again.</Alert>
            </Box>
          )}

          {/* --- ACTION BUTTONS WITH CANCEL --- */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Post Requirement'}
            </Button>
            <Button variant="outlined" component={RouterLink} to="/school/requirements">
              Cancel
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};