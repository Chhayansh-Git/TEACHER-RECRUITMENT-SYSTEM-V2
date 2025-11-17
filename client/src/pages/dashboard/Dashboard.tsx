// client/src/pages/dashboard/Dashboard.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.hooks';
import { CircularProgress, Box } from '@mui/material';

export const Dashboard = () => {
  const { userInfo } = useAppSelector((state) => state.auth);

  if (!userInfo) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  // Redirect based on the user's role
  switch (userInfo.role) {
    case 'admin':
    case 'super-admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'school':
      return <Navigate to="/school/dashboard" replace />;
    case 'group-admin': // <-- ADD THIS
      return <Navigate to="/group-admin/dashboard" replace />;
    case 'candidate':
      return <Navigate to="/candidate/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};