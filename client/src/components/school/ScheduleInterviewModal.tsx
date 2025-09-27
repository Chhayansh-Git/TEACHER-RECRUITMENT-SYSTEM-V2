// src/components/school/ScheduleInterviewModal.tsx

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Modal, Box, Typography, TextField, Button, Grid, CircularProgress, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

type InterviewFormInputs = {
  interviewDate: string;
  interviewType: 'Online' | 'In-person';
  locationOrLink: string;
  notes?: string;
};

interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  pushId: string;
  candidateName: string;
}

const scheduleInterview = async (data: InterviewFormInputs & { pushId: string }) => {
  const token = localStorage.getItem('token');
  const { data: responseData } = await api.post('/school/interviews/schedule', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return responseData;
};

export const ScheduleInterviewModal = ({ open, onClose, pushId, candidateName }: ScheduleInterviewModalProps) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors } } = useForm<InterviewFormInputs>({
    defaultValues: { interviewType: 'Online' }
  });

  const mutation = useMutation({
    mutationFn: scheduleInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pushedCandidates'] });
      onClose(); // Close the modal on success
    },
  });

  const onSubmit: SubmitHandler<InterviewFormInputs> = data => {
    mutation.mutate({ ...data, pushId });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Schedule Interview</Typography>
        <Typography sx={{ mb: 2 }}>For: {candidateName}</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller name="interviewDate" control={control} rules={{ required: 'Date is required' }} render={({ field }) => <TextField {...field} type="datetime-local" label="Interview Date & Time" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.interviewDate} helperText={errors.interviewDate?.message} />} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Interview Type</InputLabel>
                <Controller name="interviewType" control={control} render={({ field }) => (
                  <Select {...field} labelId="type-label" label="Interview Type">
                    <MenuItem value="Online">Online</MenuItem>
                    <MenuItem value="In-person">In-person</MenuItem>
                  </Select>
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Controller name="locationOrLink" control={control} rules={{ required: 'Location or Link is required' }} render={({ field }) => <TextField {...field} label="Location or Meeting Link" fullWidth error={!!errors.locationOrLink} helperText={errors.locationOrLink?.message} />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="notes" control={control} render={({ field }) => <TextField {...field} label="Notes (optional)" multiline rows={3} fullWidth />} />
            </Grid>
            {mutation.isError && (
              <Grid item xs={12}><Alert severity="error">Failed to schedule interview.</Alert></Grid>
            )}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? <CircularProgress size={24} /> : 'Schedule'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};