// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/components/school/PipelineCandidateRow.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import {
    Box,
    Typography,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

// Types
interface ICandidateInPipeline {
    _id: string;
    candidate: { _id: string; name: string; };
    status: string;
    timeline: { event: string; date: string; }[];
}

type AddressFields = {
  street: string; city: string; state: string; pinCode: string;
};

interface SanitizedProfile {
  education: { degree: string; institution: string; startYear: number; endYear: number; }[];
  experience: { jobTitle: string; company: string; companyAddress: AddressFields; startDate: string; endDate?: string; }[];
  skills: string[];
}

const fetchPublicCandidateProfile = async (candidateId: string): Promise<SanitizedProfile> => {
  const token = localStorage.getItem('token');
  // --- THIS IS THE FIX ---
  // The Authorization header must be included in the request.
  const { data } = await api.get(`/school/candidate-profile/${candidateId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const PipelineCandidateRow = ({ candidateData }: { candidateData: ICandidateInPipeline }) => {
    const [open, setOpen] = useState(false);

    const { data: profile, isLoading, isError } = useQuery<SanitizedProfile>({
        queryKey: ['publicCandidateProfile', candidateData.candidate._id],
        queryFn: () => fetchPublicCandidateProfile(candidateData.candidate._id),
        enabled: open, // Only fetch when the row is expanded
    });

    return (
        <>
            <TableRow hover>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{candidateData.candidate.name}</TableCell>
                <TableCell><Chip label={candidateData.status} size="small" variant="outlined" /></TableCell>
                <TableCell>{new Date(candidateData.timeline[0].date).toLocaleDateString()}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={5}>
                                    <Typography variant="subtitle2" fontWeight="bold">Candidate Journey</Typography>
                                    {candidateData.timeline.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(item => (
                                        <Typography key={item.event} variant="body2" color="text.secondary">
                                            <strong>{item.event}:</strong> {new Date(item.date).toLocaleString()}
                                        </Typography>
                                    ))}
                                </Grid>
                                <Grid item xs={12} md={7}>
                                     <Typography variant="subtitle2" fontWeight="bold">Professional Profile</Typography>
                                     {isLoading && <CircularProgress size={20} />}
                                     {isError && <Alert severity="warning" sx={{mt:1}}>Could not load profile details.</Alert>}
                                     {profile && (
                                         <Box>
                                             <Typography variant="caption">SKILLS</Typography>
                                             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                                {profile.skills.map(s => <Chip key={s} label={s} size="small" />)}
                                             </Box>
                                             <Typography variant="caption">EDUCATION</Typography>
                                             <List dense sx={{p:0}}>
                                                {profile.education.map((edu, i) => <ListItem key={i} sx={{p:0}}><ListItemIcon sx={{minWidth: 30}}><SchoolIcon fontSize="small"/></ListItemIcon><ListItemText primary={`${edu.degree} - ${edu.institution}`} secondary={`${edu.startYear}-${edu.endYear}`} /></ListItem>)}
                                             </List>
                                              <Typography variant="caption">EXPERIENCE</Typography>
                                             <List dense sx={{p:0}}>
                                                {profile.experience.map((exp, i) => <ListItem key={i} sx={{p:0}}><ListItemIcon sx={{minWidth: 30}}><WorkHistoryIcon fontSize="small"/></ListItemIcon><ListItemText primary={`${exp.jobTitle} at ${exp.company}`} secondary={`${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}`} /></ListItem>)}
                                             </List>
                                         </Box>
                                     )}
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};