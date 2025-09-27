// src/App.tsx

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, Navigate } from 'react-router-dom';

// Import Pages and Components
import { LoginPage } from './pages/auth/LoginPage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CompleteProfilePage } from './pages/candidate/CompleteProfilePage'; // Import new page
import { PostRequirementPage } from './pages/school/PostRequirementPage'; // Import
import { ViewRequirementsPage } from './pages/school/ViewRequirementsPage';
import { ViewJobsPage } from './pages/candidate/ViewJobsPage';
import { ManageCandidatesPage } from './pages/admin/ManageCandidatesPage';
import { ManageRequirementsPage } from './pages/admin/ManageRequirementsPage';
import { PushCandidatePage } from './pages/admin/PushCandidatePage';
import { PushedCandidatesPage } from './pages/school/PushedCandidatesPage';
import { MyInterviewsPage } from './pages/candidate/MyInterviewsPage';
import { PipelinePage } from './pages/admin/PipelinePage';
import { EditProfilePage } from './pages/candidate/EditProfilePage';
import { SchoolProfilePage } from './pages/school/SchoolProfilePage';
import { SubscriptionPage } from './pages/school/SubscriptionPage';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#d32f2f',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}> 
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/candidate/complete-profile" element={<CompleteProfilePage />} /> {/* Add new route */}
              <Route path="/school/requirements/new" element={<PostRequirementPage />} /> {/* Add new route */}
              <Route path="/school/requirements" element={<ViewRequirementsPage />} />
              <Route path="/candidate/jobs" element={<ViewJobsPage />} />
              <Route path="/admin/candidates" element={<ManageCandidatesPage />} />
              <Route path="/admin/requirements" element={<ManageRequirementsPage />} />
              <Route path="/admin/requirements/:requirementId/push" element={<PushCandidatePage />} />
              <Route path="/school/pushed-candidates" element={<PushedCandidatesPage />} />
              <Route path="/candidate/my-interviews" element={<MyInterviewsPage />} />
              <Route path="/admin/pipeline" element={<PipelinePage />} />
              <Route path="/candidate/profile" element={<EditProfilePage />} /> 
              <Route path="/school/profile" element={<SchoolProfilePage />} />
              <Route path="/school/subscription" element={<SubscriptionPage />} />
            </Route>
          </Route>
          
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

