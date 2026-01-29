import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import type { } from '@mui/material/themeCssVarsAugmentation';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

import { matchPath, useLocation } from 'react-router';
import { SidebarDisplayContext } from './DashboardSidebarPageItem';
import { useAdminState } from '../../context/AdminStateContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from './constants';
import DashboardSidebarPageItem from './DashboardSidebarPageItem';
import DashboardSidebarHeaderItem from './DashboardSidebarHeaderItem';
import DashboardSidebarDividerItem from './DashboardSidebarDividerItem';
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from './mixins';

export interface DashboardSidebarProps {
  disableCollapsibleSidebar?: boolean;
  container?: Element;
}

export default function DashboardSidebar({
  disableCollapsibleSidebar = false,
  container,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { state, dispatch } = useAdminState();
  const {
    isDesktopNavigationExpanded,
    isMobileNavigationExpanded,
    expandedItemIds,
    isFullyExpanded,
    isFullyCollapsed
  } = state.sidebar;

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const expanded = isOverMdViewport ? isDesktopNavigationExpanded : isMobileNavigationExpanded;

  const setExpanded = React.useCallback((newExpanded: boolean) => {
    if (isOverMdViewport) {
      dispatch({ type: 'SIDEBAR_SET_DESKTOP_EXPANDED', payload: newExpanded });
    } else {
      dispatch({ type: 'SIDEBAR_SET_MOBILE_EXPANDED', payload: newExpanded });
    }
  }, [dispatch, isOverMdViewport]);

  const setIsFullyExpanded = (val: boolean) => dispatch({ type: 'SIDEBAR_SET_FULLY_EXPANDED', payload: val });
  const setIsFullyCollapsed = (val: boolean) => dispatch({ type: 'SIDEBAR_SET_FULLY_COLLAPSED', payload: val });

  React.useEffect(() => {
    if (expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);
      return () => clearTimeout(drawerWidthTransitionTimeout);
    }
    setIsFullyExpanded(false);
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);
      return () => clearTimeout(drawerWidthTransitionTimeout);
    }
    setIsFullyCollapsed(false);
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = (newExpanded: boolean) => () => {
    setExpanded(newExpanded);
  };

  const handlePageItemClick = React.useCallback(
    (itemId: string, hasNestedNavigation: boolean) => {
      if (hasNestedNavigation && !mini) {
        dispatch({ type: 'SIDEBAR_TOGGLE_ITEM', payload: itemId });
      } else if (!isOverSmViewport && !hasNestedNavigation) {
        setExpanded(false);
      }
    },
    [mini, setExpanded, isOverSmViewport, dispatch],
  );

  const hasDrawerTransitions =
    isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerContent = React.useCallback(
    (viewport: 'phone' | 'tablet' | 'desktop') => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
            scrollbarGutter: mini ? 'stable' : 'auto',
            overflowX: 'hidden',
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, 'padding')
              : {}),
          }}
        >
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : 'auto',
            }}
          >
            <DashboardSidebarHeaderItem>Main</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="home"
              title="Home"
              icon={<HomeIcon />}
              href="/"
              selected={pathname === '/'}
            />
            <DashboardSidebarPageItem
              id="workouts"
              title="Workouts"
              icon={<FitnessCenterIcon />}
              href="/workouts"
              selected={!!matchPath('/workouts/*', pathname)}
            />
            <DashboardSidebarPageItem
              id="routines"
              title="Routines"
              icon={<EventNoteIcon />}
              href="/routines"
              selected={!!matchPath('/routines/*', pathname)}
            />
            <DashboardSidebarPageItem
              id="exercises"
              title="Exercises"
              icon={<DirectionsRunIcon />}
              href="/exercises"
              selected={!!matchPath('/exercises/*', pathname)}
            />
            <DashboardSidebarPageItem
              id="gyms"
              title="Gyms"
              icon={<Box component={FitnessCenterIcon} sx={{ transform: 'rotate(90deg)' }} />}
              href="/gyms"
              selected={!!matchPath('/gyms/*', pathname)}
            />
            <DashboardSidebarPageItem
              id="muscles"
              title="Muscles"
              icon={<AccessibilityIcon />}
              href="/muscles"
              selected={!!matchPath('/muscles/*', pathname)}
            />
            <DashboardSidebarDividerItem />
            <DashboardSidebarHeaderItem>System</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="settings"
              title="Settings"
              icon={<SettingsIcon />}
              href="/settings"
              selected={!!matchPath('/settings/*', pathname)}
            />
          </List>
        </Box>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, expandedItemIds, pathname],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

      return {
        displayPrint: 'none',
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: 'absolute',
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(() => {
    return {
      onPageItemClick: handlePageItemClick,
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
    };
  }, [
    handlePageItemClick,
    mini,
    isFullyExpanded,
    isFullyCollapsed,
    hasDrawerTransitions,
  ]);

  return (
    <SidebarDisplayContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: 'block',
            sm: disableCollapsibleSidebar ? 'block' : 'none',
            md: 'none',
          },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent('phone')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: 'none',
            sm: disableCollapsibleSidebar ? 'none' : 'block',
            md: 'none',
          },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('tablet')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('desktop')}
      </Drawer>
    </SidebarDisplayContext.Provider>
  );
}
