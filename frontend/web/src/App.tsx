import { createHashRouter, RouterProvider } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '@web/theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from '@web/theme/customizations';
import DashboardLayout from '@web/components/dashboard/DashboardLayout';
import HomePage from '@web/pages/HomePage';

import ExerciseList from '@web/pages/exercises/ExerciseList';
import ExerciseCreate from '@web/pages/exercises/ExerciseCreate';
import ExerciseEdit from '@web/pages/exercises/ExerciseEdit';
import GymList from '@web/pages/gyms/GymList';
import GymCreate from '@web/pages/gyms/GymCreate';
import GymEdit from '@web/pages/gyms/GymEdit';
import MuscleList from '@web/pages/muscles/MuscleList';
import MuscleCreate from '@web/pages/muscles/MuscleCreate';
import MuscleEdit from '@web/pages/muscles/MuscleEdit';
import WorkoutCreate from '@web/pages/workouts/WorkoutCreate';
import WorkoutList from '@web/pages/workouts/WorkoutList';
import WorkoutEdit from '@web/pages/workouts/WorkoutEdit';
import RoutineCreate from '@web/pages/routines/RoutineCreate';
import RoutineList from '@web/pages/routines/RoutineList';
import RoutineEdit from '@web/pages/routines/RoutineEdit';
import NotificationsProvider from '@web/providers/NotificationsProvider';
import DialogsProvider from '@web/providers/DialogsProvider';
import '@web/App.css';

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
