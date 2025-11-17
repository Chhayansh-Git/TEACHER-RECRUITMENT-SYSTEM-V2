// client/src/components/layout/DashboardLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { logout } from '../../app/authSlice';

// MUI Components
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Chip
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RedEnvelopeIcon from '@mui/icons-material/CardGiftcard';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChatIcon from '@mui/icons-material/Chat';

const drawerWidth = 240;
const API_BASE_URL = 'http://localhost:5001';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawerContent = (
    <div>
      <Toolbar />
      <List>
        <ListItem disablePadding component={RouterLink} to="/dashboard">
          <ListItemButton>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* --- Candidate Links --- */}
        {userInfo?.role === 'candidate' && (
          <>
            <ListItem disablePadding component={RouterLink} to="/candidate/profile">
              <ListItemButton>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary="View Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/candidate/jobs">
              <ListItemButton>
                <ListItemIcon><WorkIcon /></ListItemIcon>
                <ListItemText primary="Job Board" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/candidate/my-applications">
              <ListItemButton>
                <ListItemIcon><FactCheckIcon /></ListItemIcon>
                <ListItemText primary="My Applications" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/candidate/my-interviews">
              <ListItemButton>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary="My Interviews" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/candidate/my-offers">
              <ListItemButton>
                <ListItemIcon><RedEnvelopeIcon /></ListItemIcon>
                <ListItemText primary="My Offers" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* --- School Links --- */}
        {userInfo?.role === 'school' && (
         <>
            <ListItem disablePadding component={RouterLink} to="/school/profile">
                <ListItemButton>
                    <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                    <ListItemText primary="View Profile" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/school/requirements">
              <ListItemButton>
                <ListItemIcon><ArticleIcon /></ListItemIcon>
                <ListItemText primary="My Postings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/school/pushed-candidates">
              <ListItemButton>
                <ListItemIcon><HowToRegIcon /></ListItemIcon>
                <ListItemText primary="Recommended" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/school/subscription">
              <ListItemButton>
                <ListItemIcon><WorkspacePremiumIcon /></ListItemIcon>
                <ListItemText primary="Subscription" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        
        {/* --- Group Admin Links --- */}
        {userInfo?.role === 'group-admin' && (
          <>
            <ListItem disablePadding component={RouterLink} to="/group-admin/manage-schools">
                <ListItemButton>
                    <ListItemIcon><CorporateFareIcon /></ListItemIcon>
                    <ListItemText primary="Manage Schools" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/group-admin/analytics">
                <ListItemButton>
                    <ListItemIcon><AnalyticsIcon /></ListItemIcon>
                    <ListItemText primary="Group Analytics" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/school/subscription">
              <ListItemButton>
                <ListItemIcon><WorkspacePremiumIcon /></ListItemIcon>
                <ListItemText primary="Subscription" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        
        {/* --- Admin Links --- */}
        {(userInfo?.role === 'admin' || userInfo?.role === 'super-admin') && (
          <>
            <ListItem disablePadding component={RouterLink} to="/admin/candidates">
              <ListItemButton>
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Manage Candidates" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/admin/requirements">
              <ListItemButton>
                <ListItemIcon><AssignmentIcon /></ListItemIcon>
                <ListItemText primary="Manage Requirements" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/admin/pipeline">
              <ListItemButton>
                <ListItemIcon><TimelineIcon /></ListItemIcon>
                <ListItemText primary="Pipeline" />
              </ListItemButton>
            </ListItem>
             <ListItem disablePadding component={RouterLink} to="/admin/email-templates">
                <ListItemButton>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText primary="Email Templates" />
                </ListItemButton>
            </ListItem>
             <ListItem disablePadding component={RouterLink} to="/admin/reports">
                <ListItemButton>
                    <ListItemIcon><AssessmentIcon /></ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton>
            </ListItem>
             <ListItem disablePadding component={RouterLink} to="/admin/settings">
                <ListItemButton>
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Universal Chat Link for relevant roles */}
        {(userInfo?.role === 'school' || userInfo?.role === 'group-admin') && (
            <ListItem disablePadding component={RouterLink} to="/chat">
              <ListItemButton>
                <ListItemIcon><ChatIcon /></ListItemIcon>
                <ListItemText primary="Messages" />
              </ListItemButton>
            </ListItem>
        )}

        <ListItem disablePadding onClick={handleLogout}>
          <ListItemButton>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Teacher Recruitment System
          </Typography>

          {/* --- VISUAL INDICATOR FOR IN-GROUP SCHOOLS --- */}
          {userInfo?.role === 'school' && userInfo.organization && (
            <Chip 
              label={`Part of: ${userInfo.organization.name}`} 
              size="small"
              sx={{ ml: 2, color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} 
            />
          )}

          <Box sx={{ flexGrow: 1 }} />
          <Avatar src={userInfo?.profilePictureUrl ? `${API_BASE_URL}${userInfo.profilePictureUrl}` : undefined}>
            {userInfo?.name.charAt(0)}
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};