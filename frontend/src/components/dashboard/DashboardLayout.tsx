import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import SitemarkIcon from './SitemarkIcon';
import { useAdminState } from '../../context/AdminStateContext';

export default function DashboardLayout() {
  const theme = useTheme();
  const { state, dispatch } = useAdminState();
  const { isDesktopNavigationExpanded, isMobileNavigationExpanded } = state.sidebar;

  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const isNavigationExpanded = isOverMdViewport
    ? isDesktopNavigationExpanded
    : isMobileNavigationExpanded;

  const handleToggleHeaderMenu = React.useCallback(
    (open: boolean) => {
      if (isOverMdViewport) {
        dispatch({ type: 'SIDEBAR_SET_DESKTOP_EXPANDED', payload: open });
      } else {
        dispatch({ type: 'SIDEBAR_SET_MOBILE_EXPANDED', payload: open });
      }
    },
    [dispatch, isOverMdViewport]
  );

  const layoutRef = React.useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={layoutRef}
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        height: '100vh',
        width: '100%',
      }}
    >
      <DashboardHeader
        logo={<SitemarkIcon />}
        title="Admin Dashboard"
        menuOpen={isNavigationExpanded}
        onToggleMenu={handleToggleHeaderMenu}
      />
      <DashboardSidebar
        container={layoutRef?.current ?? undefined}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Toolbar sx={{ displayPrint: 'none' }} />
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
