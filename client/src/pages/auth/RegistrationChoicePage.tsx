// client/src/pages/auth/RegistrationChoicePage.tsx

import { Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

export const RegistrationChoicePage = () => {
    const choiceBoxStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 3,
            transform: 'translateY(-4px)'
        },
        transition: 'all 0.2s ease-in-out',
    };
    
    return (
        <Container component="main" maxWidth="md">
            <Paper sx={{ mt: 8, p: 4, textAlign: 'center' }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    Join Our Platform
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Please select your role to get started.
                </Typography>
                <Grid container spacing={4} alignItems="stretch">
                    <Grid item xs={12} sm={4}>
                        <Box
                            component={RouterLink}
                            to="/register/candidate"
                            sx={choiceBoxStyles}
                        >
                            <PersonIcon sx={{ fontSize: 50 }} color="primary" />
                            <Typography variant="h6" mt={1}>
                                I am a Candidate
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Looking for my next teaching opportunity.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box
                           component={RouterLink}
                           to="/register/school"
                           sx={choiceBoxStyles}
                        >
                            <SchoolIcon sx={{ fontSize: 50 }} color="primary" />
                            <Typography variant="h6" mt={1}>
                                I am an Individual School
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Looking to hire talented educators.
                            </Typography>
                        </Box>
                    </Grid>
                     <Grid item xs={12} sm={4}>
                        <Box
                           component={RouterLink}
                           to="/register/group"
                           sx={choiceBoxStyles}
                        >
                            <CorporateFareIcon sx={{ fontSize: 50 }} color="primary" />
                            <Typography variant="h6" mt={1}>
                                I am a School Group
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                I want to manage multiple institutions.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};