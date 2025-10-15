// src/components/school/SendOfferModal.tsx

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { Modal, Box, Typography, TextField, Button, Grid, CircularProgress } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

type OfferFormInputs = {
  offeredSalary: number;
  joiningDate: string;
  offerDetails: string;
};

interface SendOfferModalProps {
  open: boolean;
  onClose: () => void;
  pushedCandidateId: string;
  candidateName: string;
  jobTitle: string;
}

const sendOffer = async (data: OfferFormInputs & { pushedCandidateId: string }) => {
  const token = localStorage.getItem('token');
  const { data: responseData } = await api.post('/offers/send', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return responseData;
};

export const SendOfferModal = ({ open, onClose, pushedCandidateId, candidateName, jobTitle }: SendOfferModalProps) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors } } = useForm<OfferFormInputs>();

  const mutation = useMutation({
    mutationFn: sendOffer,
    onSuccess: () => {
      toast.success('Offer letter sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['pushedCandidates'] });
      onClose();
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to send offer.');
    }
  });

  const onSubmit: SubmitHandler<OfferFormInputs> = data => {
    mutation.mutate({ ...data, pushedCandidateId });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Send Job Offer</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To: {candidateName} for the role of {jobTitle}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller name="offeredSalary" control={control} rules={{ required: 'Salary is required', valueAsNumber: true }} render={({ field }) => <TextField {...field} type="number" label="Offered Annual Salary (INR)" fullWidth error={!!errors.offeredSalary} helperText={errors.offeredSalary?.message} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="joiningDate" control={control} rules={{ required: 'Joining date is required' }} render={({ field }) => <TextField {...field} type="date" label="Proposed Joining Date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.joiningDate} helperText={errors.joiningDate?.message} />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="offerDetails" control={control} rules={{ required: 'Offer details are required' }} render={({ field }) => <TextField {...field} label="Offer Details & Inclusions" multiline rows={6} fullWidth error={!!errors.offerDetails} helperText={errors.offerDetails?.message} />} />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? <CircularProgress size={24} /> : 'Send Offer'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};