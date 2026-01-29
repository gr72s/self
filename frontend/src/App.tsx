import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import WorkoutPage from '@/pages/WorkoutPage';
import RoutinePage from '@/pages/RoutinePage';
import ExercisePage from '@/pages/ExercisePage';
import GymPage from '@/pages/GymPage';
import MusclePage from '@/pages/MusclePage';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminStateProvider } from '@/context/AdminStateContext';
import '@/App.css';

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

function App() {
  return (
    <AdminStateProvider>
      <AppTheme themeComponents={themeComponents}>
        <CssBaseline enableColorScheme />
        <Router>
          <Routes>
            {/* 登录页面 */}
            <Route path="/login" element={<LoginPage />} />

            {/* 受保护的路由 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<HomePage />} />
                <Route path="workouts">
                  <Route index element={<WorkoutPage />} />
                  <Route path=":id" element={<div>训练详情</div>} />
                  <Route path="new" element={<div>开始新训练</div>} />
                  <Route path=":id/edit" element={<div>编辑训练</div>} />
                </Route>
                <Route path="routines">
                  <Route index element={<RoutinePage />} />
                  <Route path=":id" element={<div>训练计划详情</div>} />
                  <Route path="new" element={<div>创建新计划</div>} />
                  <Route path=":id/edit" element={<div>编辑训练计划</div>} />
                </Route>
                <Route path="exercises" element={<ExercisePage />} />
                <Route path="gyms" element={<GymPage />} />
                <Route path="muscles" element={<MusclePage />} />
                <Route path="settings" element={<div>设置</div>} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AppTheme>
    </AdminStateProvider>
  );
}

export default App;
