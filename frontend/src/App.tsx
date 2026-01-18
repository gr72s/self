import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import WorkoutPage from '@/pages/WorkoutPage';
import RoutinePage from '@/pages/RoutinePage';
import '@/App.css';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
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
            <Route path="settings" element={<div>设置</div>} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
