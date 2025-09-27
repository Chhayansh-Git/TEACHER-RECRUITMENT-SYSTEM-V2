// src/components/layout/DashboardLayout.tsx

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
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const drawerWidth = 240;

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth); // <-- Get user info

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
        {/* --- Common Navigation Items --- */}
        <ListItem disablePadding component={RouterLink} to="/dashboard">
          <ListItemButton>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

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
          </>
        )}


        {userInfo?.role === 'candidate' && (
          <><ListItem disablePadding component={RouterLink} to="/candidate/jobs">
            <ListItemButton>
              <ListItemIcon><WorkIcon /></ListItemIcon>
              <ListItemText primary="Job Board" />
            </ListItemButton>
          </ListItem><ListItem disablePadding component={RouterLink} to="/candidate/my-interviews">
              <ListItemButton>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary="My Interviews" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={RouterLink} to="/candidate/profile"> {/* Make this a link */}
              <ListItemButton>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary="Edit Profile" />
              </ListItemButton>
            </ListItem></>
        )}

        {/* --- Role-Specific Navigation --- */}
        {userInfo?.role === 'school' && (
          <>
            <ListItem disablePadding component={RouterLink} to="/school/requirements/new">
              <ListItemButton>
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="Post a Job" />
              </ListItemButton>
            </ListItem><ListItem disablePadding component={RouterLink} to="/school/requirements">
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
            <ListItem disablePadding component={RouterLink} to="/school/profile">
                <ListItemButton>
                    <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                    <ListItemText primary="Edit Profile" />
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

        {/* --- Logout Button --- */}
        <ListItem disablePadding onClick={handleLogout}>
          <ListItemButton>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
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
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
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
        <Toolbar /> {/* Spacer for under the AppBar */}
        <Outlet /> {/* This is where our page content will be rendered */}
      </Box>
    </Box>
  );
};