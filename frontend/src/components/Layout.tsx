import React from 'react';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import { FitnessCenter as FitnessCenterIcon, CalendarToday as CalendarIcon, Settings as SettingsIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div">
            健身管理系统
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/">
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="首页" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/workouts">
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText primary="训练记录" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/routines">
                <ListItemIcon>
                  <FitnessCenterIcon />
                </ListItemIcon>
                <ListItemText primary="训练计划" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/settings">
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="设置" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
