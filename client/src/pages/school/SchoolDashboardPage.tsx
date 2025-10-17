// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/pages/school/SchoolDashboardPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip as MuiTooltip
} from '@mui/material';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { BlurredOverlay } from '../../components/common/BlurredOverlay';
import { UpgradePrompt } from '../../components/common/UpgradePrompt';


// Interface now includes the flag from the backend
interface IAnalyticsData {
  hasAdvancedAnalytics: boolean;
  funnel: {
    recommended: number;
    shortlisted: number;
    interviewScheduled: number;
    offerSent: number;
    hired: number;
  };
  kpis: {
    openRequirements: number;
    offerAcceptanceRate?: number;
    totalHires?: number;
  };
  recentHires?: {
    candidateName: string;
    jobTitle: string;
    timeToFill: number;
  }[];
}


const fetchDashboardAnalytics = async (): Promise<IAnalyticsData> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/school/dashboard-analytics', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const StatCard = ({ title, value, tooltip, onClick }: { title: string, value: string | number, tooltip?: string, onClick?: () => void }) => (
  <Paper 
    sx={{ 
      p: 3, 
      textAlign: 'center', 
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        boxShadow: onClick ? 6 : 2,
        transform: onClick ? 'translateY(-2px)' : 'none'
      },
      transition: 'all 0.2s ease-in-out',
      position: 'relative',
      height: '100%'
    }} 
    onClick={onClick}
    elevation={2}
  >
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        {tooltip && (
            <MuiTooltip title={tooltip}>
                <InfoOutlinedIcon fontSize="small" color="action" />
            </MuiTooltip>
        )}
    </Box>
    <Typography variant="h3" fontWeight="bold" color="primary">{value}</Typography>
  </Paper>
);

const CustomFunnelLabel = (props: any) => {
    const { x, y, width, height, value, name, conversionRate } = props;
    const labelX = x + width + 20;
    const labelY = y + height / 2;

    if (value === 0) return null;

    return (
        <g>
            <text x={labelX} y={labelY} dy={-8} fill="#333" textAnchor="start" dominantBaseline="middle" fontSize="16px" fontWeight="bold">
                {value} {name}
            </text>
            {conversionRate !== null && (
                 <text x={labelX} y={labelY} dy={12} fill="#777" textAnchor="start" dominantBaseline="middle" fontSize="12px">
                    ({conversionRate}% conversion)
                </text>
            )}
        </g>
    );
};


export const SchoolDashboardPage = () => {
  const navigate = useNavigate();
  const { data: analytics, isLoading, isError } = useQuery<IAnalyticsData>({
    queryKey: ['schoolDashboardAnalytics'],
    queryFn: fetchDashboardAnalytics,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load dashboard analytics.</Alert>;

  const funnelRaw = analytics?.funnel;
  const overallConversion = (funnelRaw?.recommended ?? 0) > 0 ? Math.round(((analytics?.kpis.totalHires || 0) / funnelRaw!.recommended) * 100) : 0;
  
  const funnelData = [
    { name: 'Recommended', value: funnelRaw?.recommended || 0, conversionRate: null, fill: '#6B728E' },
    { name: 'Shortlisted', value: funnelRaw?.shortlisted || 0, conversionRate: (funnelRaw?.recommended ?? 0) > 0 ? Math.round((funnelRaw!.shortlisted / funnelRaw!.recommended) * 100) : 0, fill: '#4E5BA6' },
    { name: 'Interviewed', value: funnelRaw?.interviewScheduled || 0, conversionRate: (funnelRaw?.shortlisted ?? 0) > 0 ? Math.round((funnelRaw!.interviewScheduled / funnelRaw!.shortlisted) * 100) : 0, fill: '#3C4F76' },
    { name: 'Offered', value: funnelRaw?.offerSent || 0, conversionRate: (funnelRaw?.interviewScheduled ?? 0) > 0 ? Math.round((funnelRaw!.offerSent / funnelRaw!.interviewScheduled) * 100) : 0, fill: '#3A2E39' },
    { name: 'Hired', value: funnelRaw?.hired || 0, conversionRate: (funnelRaw?.offerSent ?? 0) > 0 ? Math.round((funnelRaw!.hired / funnelRaw!.offerSent) * 100) : 0, fill: '#1E152A' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Open Jobs" 
            value={analytics?.kpis.openRequirements || 0} 
            onClick={() => navigate('/school/requirements')}
            tooltip="Click to view all your job postings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard 
                title="Total Recommended"
                value={analytics?.funnel.recommended || 0}
                onClick={() => navigate('/school/pushed-candidates')}
                tooltip="Click to view all recommended candidates"
            />
        </Grid>

        {analytics?.hasAdvancedAnalytics ? (
            <>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Overall Conversion" 
                    value={`${overallConversion}%`}
                    tooltip="Percentage of candidates hired from the total number recommended"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Offer Acceptance" 
                    value={`${analytics?.kpis.offerAcceptanceRate || 0}%`}
                    tooltip="Percentage of offers that were accepted by candidates"
                  />
                </Grid>
            </>
        ) : (
            <Grid item xs={12} sm={6}>
                <UpgradePrompt featureName="Unlock KPIs" message="Track conversion rates and offer acceptance to make smarter hiring decisions." />
            </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: '450px', position: 'relative' }}>
            <Typography variant="h6" gutterBottom>Recruitment Funnel</Typography>
            {analytics?.hasAdvancedAnalytics ? (
                <>
                    <Typography variant="caption" color="text.secondary">Shows the conversion rate from the previous stage.</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <FunnelChart margin={{ left: 150, right: 150 }}>
                        <Tooltip />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                           {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          <LabelList content={<CustomFunnelLabel />} />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <BlurredOverlay featureName="Recruitment Funnel" message="Visualize your entire hiring process and identify bottlenecks." />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
            <Paper sx={{p: 3, height: '450px', position: 'relative'}}>
                <Typography variant="h6" gutterBottom>Hiring Velocity</Typography>
                {analytics?.hasAdvancedAnalytics ? (
                    <>
                        <Typography variant="caption" color="text.secondary">Time taken from recommendation to hiring for recent positions.</Typography>
                        <TableContainer sx={{mt: 1}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Candidate</TableCell>
                                        <TableCell>Job Title</TableCell>
                                        <TableCell align="right">Days to Fill</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analytics?.recentHires && analytics.recentHires.length > 0 ? analytics?.recentHires.map((hire, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{hire.candidateName}</TableCell>
                                            <TableCell>{hire.jobTitle}</TableCell>
                                            <TableCell align="right">
                                              <Chip label={`${hire.timeToFill} days`} color={hire.timeToFill < 15 ? 'success' : 'warning'} size="small"/>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} align="center">No recent hires to display.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                ) : (
                     <BlurredOverlay featureName="Hiring Velocity" message="Track how quickly you hire top talent and optimize your process." />
                )}
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};