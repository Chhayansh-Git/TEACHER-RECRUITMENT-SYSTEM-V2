// src/components/school/CandidateProfileModal.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

const API_BASE_URL = 'http://localhost:5001';

// --- Types for the sanitized profile data ---
type AddressFields = {
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

interface SanitizedProfile {
  user: {
    _id: string;
    name: string;
    profilePictureUrl?: string;
  };
  education: {
    degree: string;
    institution: string;
    startYear: number;
    endYear: number;
  }[];
  experience: {
    jobTitle: string;
    company: string;
    companyAddress: AddressFields;
    startDate: string;
    endDate?: string;
  }[];
  skills: string[];
  preferredLocations: string[];
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '80%', md: '60%' },
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const fetchPublicCandidateProfile = async (candidateId: string): Promise<SanitizedProfile> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get(`/school/candidate-profile/${candidateId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

interface CandidateProfileModalProps {
  open: boolean;
  onClose: () => void;
  candidateId: string | null;
}

export const CandidateProfileModal = ({ open, onClose, candidateId }: CandidateProfileModalProps) => {
  const { data: profile, isLoading, isError, error } = useQuery<SanitizedProfile>({
    queryKey: ['publicCandidateProfile', candidateId],
    queryFn: () => fetchPublicCandidateProfile(candidateId!),
    enabled: !!candidateId, // Only fetch when a candidateId is provided
    retry: false,
  });
  
  // Helper to format address
  const formatAddress = (address: AddressFields | undefined) => {
    if (!address) return 'Not Provided';
    const parts = [address.city, address.state, address.pinCode].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        
        {isLoading && <CircularProgress />}
        {isError && <Alert severity="error">{(error as any)?.response?.data?.message || 'Could not load profile.'}</Alert>}
        
        {profile && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
               <Avatar
                  src={profile.user.profilePictureUrl ? `${API_BASE_URL}${profile.user.profilePictureUrl}` : undefined}
                  sx={{ width: 120, height: 120, margin: '0 auto 16px', fontSize: '3rem' }}
                >
                  {profile.user.name.charAt(0)}
                </Avatar>
                <Typography variant="h5">{profile.user.name}</Typography>
                <Divider sx={{ my: 2 }} />
                 <Typography variant="subtitle2" sx={{ mb: 1 }}>Preferred Locations:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {profile.preferredLocations?.map(loc => <Chip key={loc} label={loc} size="small" />)}
                </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.skills?.map(skill => <Chip key={skill} label={skill} color="primary" variant="outlined" />)}
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
               <Box mb={3}>
                <Typography variant="h6" gutterBottom>Education</Typography>
                <List dense>
                  {profile.education?.map((edu, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemIcon><SchoolIcon /></ListItemIcon>
                      <ListItemText primary={`${edu.degree} - ${edu.institution}`} secondary={`${edu.startYear} - ${edu.endYear}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Divider sx={{ my: 2 }} />
               <Box>
                <Typography variant="h6" gutterBottom>Work Experience</Typography>
                <List dense>
                  {profile.experience?.map((exp, i) => (
                     <ListItem key={i} disableGutters>
                      <ListItemIcon><WorkHistoryIcon /></ListItemIcon>
                      <ListItemText 
                        primary={`${exp.jobTitle} at ${exp.company}`}
                        secondary={`${formatAddress(exp.companyAddress)} | ${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Modal>
  );
};