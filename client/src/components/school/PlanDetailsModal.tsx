import {
  Modal, Box, Typography, IconButton, Table, TableContainer,
  TableHead, TableRow, TableCell, TableBody, Button, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { IPlan } from '../../pages/school/SubscriptionPage'; // Assuming IPlan is exported from there

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: '80%' },
  maxWidth: '900px',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// --- In-depth feature explanations for the modal ---
const featureMatrix = [
    { id: 'jobs', title: 'Active Job Postings', description: 'The number of jobs you can have open simultaneously.' },
    { id: 'matches', title: 'AI Candidate Matches', description: 'Our AI instantly shows you the most relevant candidates, saving hours of screening.' },
    { id: 'profiles', title: 'Full Candidate Profile Views', description: 'Get a complete view of a candidate\'s professional history to make better-informed decisions.' },
    { id: 'analytics', title: 'Advanced Analytics Dashboard', description: 'Track your entire recruitment funnel, identify bottlenecks, and monitor key hiring metrics.' },
    { id: 'group', title: 'Group / Chain Management', description: 'Manage billing and view aggregated analytics for all your institutions from a single dashboard.' },
    { id: 'users', title: 'User Accounts', description: 'Allow multiple members of your hiring team to collaborate on the platform.' },
];

interface PlanDetailsModalProps {
  open: boolean;
  onClose: () => void;
  plans: IPlan[];
  selectedPlan: IPlan | null;
  onUpgradeClick: (plan: IPlan) => void;
}

export const PlanDetailsModal = ({ open, onClose, plans, selectedPlan, onUpgradeClick }: PlanDetailsModalProps) => {
  if (!selectedPlan) return null;

  const getFeatureValue = (plan: IPlan, featureId: string) => {
    switch(featureId) {
        case 'jobs': return plan.maxJobs === -1 ? 'Unlimited' : plan.maxJobs;
        case 'matches': return plan.candidateMatchesLimit === -1 ? 'Unlimited' : `Top ${plan.candidateMatchesLimit}`;
        case 'profiles': return plan.canViewFullProfile ? <CheckCircleIcon color="success" /> : `${plan.weeklyProfileViews} / week`;
        case 'analytics': return plan.hasAdvancedAnalytics ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />;
        case 'group': return plan.name === 'Enterprise' ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />;
        case 'users': return plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers;
        default: return '-';
    }
  }

  const sortedPlans = [...plans].sort((a,b) => a.price - b.price);

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
        
        <Typography variant="h4" gutterBottom fontWeight="bold">Compare Plans</Typography>
        <Typography color="text.secondary" sx={{mb: 3}}>
            See how the features stack up and choose the best plan to supercharge your hiring.
        </Typography>

        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: '30%'}}></TableCell>
                        {sortedPlans.map(plan => (
                            <TableCell key={plan._id} align="center" sx={{
                                borderBottom: 2,
                                borderColor: plan.name === selectedPlan.name ? 'primary.main' : 'transparent',
                            }}>
                                <Typography variant="h6" color={plan.name === selectedPlan.name ? 'primary' : 'text.primary'}>{plan.name}</Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {featureMatrix.map(feature => (
                        <TableRow key={feature.id} hover>
                            <TableCell component="th" scope="row">
                                <Typography fontWeight="bold">{feature.title}</Typography>
                                <Typography variant="caption" color="text.secondary">{feature.description}</Typography>
                            </TableCell>
                            {sortedPlans.map(plan => (
                                <TableCell key={plan._id} align="center" sx={{
                                     fontWeight: 'bold',
                                     backgroundColor: plan.name === selectedPlan.name ? 'action.hover' : 'inherit'
                                }}>
                                    {getFeatureValue(plan, feature.id)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell></TableCell>
                         {sortedPlans.map(plan => (
                             <TableCell key={plan._id} align="center" sx={{
                                backgroundColor: plan.name === selectedPlan.name ? 'action.hover' : 'inherit',
                                borderTop: 1,
                                borderColor: 'grey.300'
                             }}>
                                <Button 
                                    variant={plan.name === selectedPlan.name ? 'contained' : 'outlined'}
                                    sx={{mt: 2}}
                                    onClick={() => onUpgradeClick(plan)}
                                    disabled={plan.name === 'Basic'}
                                >
                                     {plan.name === 'Basic' ? 'Current Plan' : `Choose ${plan.name}`}
                                </Button>
                             </TableCell>
                         ))}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};