// src/pages/public/LandingPage.tsx

import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export const LandingPage = () => {
  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f4f6f8' }}>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            TeacherRecruit
          </Typography>
          <Button component={RouterLink} to="/login" color="primary">Login</Button>
          <Button component={RouterLink} to="/register" variant="contained" color="primary" sx={{ ml: 2 }}>Sign Up</Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Connecting Educators with Institutions
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          The premier platform for discovering teaching talent and finding your next career opportunity in education. AI-powered, efficient, and built for you.
        </Typography>
        <Button component={RouterLink} to="/register" variant="contained" color="secondary" size="large" sx={{ mt: 4 }}>
          Get Started Today
        </Button>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'white', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <SchoolIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>For Schools</Typography>
                <Typography>Access a curated pool of verified, talented educators recommended by our intelligent matching system.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <WorkIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>For Candidates</Typography>
                <Typography>Build your professional profile and get discovered by top institutions looking for your unique skills.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <HowToRegIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>Verified & Efficient</Typography>
                <Typography>Our admin-driven process ensures quality connections, saving time for both schools and candidates.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 6, textAlign: 'center', backgroundColor: '#eef2f6' }}>
        <Container maxWidth="lg">
          <Typography variant="h6" gutterBottom>
            TeacherRecruit
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="p">
            © {new Date().getFullYear()} All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};