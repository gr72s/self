import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardActionArea, CardContent, CircularProgress, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { workoutApi, userApi } from '@web/services/api';
import type { WorkoutResponse } from '@/types';
import { Link } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';

const HomePage: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutResponse | null>(null);
  const [user, setUser] = useState<any>(null); // Using any for now as UserResponse type isn't strictly defined on frontend yet

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getCurrent();
        if (response.status === 200 && response.data) {
          setUser((response.data as any).data || response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    const fetchWorkouts = async () => {
      try {
        const response = await workoutApi.getAll();
        if (response.status === 200 && response.data) {
          setWorkouts((response.data as any).data || response.data);
        }
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentWorkout = async () => {
      try {
        const response = await workoutApi.getInProcess();
        if (response.status === 200 && response.data) {
          setCurrentWorkout((response.data as any).data || response.data);
        }
      } catch (error) {
        console.error('Failed to fetch current workout:', error);
      }
    };

    fetchUser();
    fetchWorkouts();
    fetchCurrentWorkout();
  }, []);

  return (
    <PageContainer 
      title={`Welcome back${user?.username ? `, ${user.username}` : ''}`} 
      breadcrumbs={[{ title: 'Home' }]}
    >
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/workouts">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 40, mr: 2, color: '#1976d2' }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      Total Workouts
                    </Typography>
                    <Typography variant="h4">
                      {workouts.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/routines">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessCenterIcon sx={{ fontSize: 40, mr: 2, color: '#43a047' }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      Routines Used
                    </Typography>
                    <Typography variant="h4">
                      {new Set(workouts.map(w => w.routine?.id)).size}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardActionArea component={Link} to="/workouts">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mr: 2, color: '#f57c00' }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      This Month
                    </Typography>
                    <Typography variant="h4">
                      {workouts.filter(w => {
                        const date = new Date(w.startTime || '');
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Current Workout */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Current Workout
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : currentWorkout ? (
          <Box>
            <Typography variant="h6">
              {currentWorkout.routine?.name || 'Unnamed Workout'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Started: {new Date(currentWorkout.startTime || '').toLocaleString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/workouts/${currentWorkout.id}`}
              >
                View Details
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No active workout
          </Typography>
        )}
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          <Button variant="outlined" component={Link} to="/workouts">
            View All
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : workouts.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No workout history
          </Typography>
        ) : (
          <Box>
            {workouts.slice(0, 5).map(workout => (
              <Box
                key={workout.id}
                sx={{
                  p: 2,
                  mb: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {workout.routine?.name || 'Unnamed Workout'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(workout.startTime || '').toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {workout.startTime ? new Date(workout.startTime).toLocaleTimeString() : ''} -
                  {workout.endTime ? new Date(workout.endTime).toLocaleTimeString() : 'In Progress'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </PageContainer>
  );
};

export default HomePage;
