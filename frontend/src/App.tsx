import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '@/theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from '@/theme/customizations';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import HomePage from '@/pages/HomePage';

import ExerciseList from '@/pages/exercises/ExerciseList';
import ExerciseCreate from '@/pages/exercises/ExerciseCreate';
import ExerciseEdit from '@/pages/exercises/ExerciseEdit';
import GymList from '@/pages/gyms/GymList';
import GymCreate from '@/pages/gyms/GymCreate';
import GymEdit from '@/pages/gyms/GymEdit';
import MuscleList from '@/pages/muscles/MuscleList';
import MuscleCreate from '@/pages/muscles/MuscleCreate';
import MuscleEdit from '@/pages/muscles/MuscleEdit';
import WorkoutCreate from '@/pages/workouts/WorkoutCreate';
import WorkoutList from '@/pages/workouts/WorkoutList';
import WorkoutEdit from '@/pages/workouts/WorkoutEdit';
import RoutineCreate from '@/pages/routines/RoutineCreate';
import RoutineList from '@/pages/routines/RoutineList';
import RoutineEdit from '@/pages/routines/RoutineEdit';
import NotificationsProvider from '@/providers/NotificationsProvider';
import DialogsProvider from '@/providers/DialogsProvider';
import '@/App.css';

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

const router = createHashRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'workouts',
        children: [
          { index: true, element: <WorkoutList /> },
          { path: ':id', element: <div>训练详情</div> },
          { path: 'new', element: <WorkoutCreate /> },
          { path: ':id/edit', element: <WorkoutEdit /> },
        ],
      },
      {
        path: 'routines',
        children: [
          { index: true, element: <RoutineList /> },
          { path: ':id', element: <div>训练计划详情</div> },
          { path: 'new', element: <RoutineCreate /> },
          { path: ':id/edit', element: <RoutineEdit /> },
        ],
      },
      {
        path: 'exercises',
        children: [
          { index: true, element: <ExerciseList /> },
          { path: 'new', element: <ExerciseCreate /> },
          { path: ':id/edit', element: <ExerciseEdit /> },
        ],
      },
      {
        path: 'gyms',
        children: [
          { index: true, element: <GymList /> },
          { path: 'new', element: <GymCreate /> },
          { path: ':id/edit', element: <GymEdit /> },
        ],
      },
      {
        path: 'muscles',
        children: [
          { index: true, element: <MuscleList /> },
          { path: 'new', element: <MuscleCreate /> },
          { path: ':id/edit', element: <MuscleEdit /> },
        ],
      },
      {
        path: 'settings',
        element: <div>设置</div>,
      },
    ],
  },
]);

function App() {
  return (
    <AppTheme themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}

export default App;
