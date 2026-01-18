import React, {useEffect, useState} from 'react';
import {Box, Button, Card, CardActionArea, CardContent, CircularProgress, Grid, Paper, Typography} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {workoutApi} from '@/services/api';
import type {WorkoutResponse} from '@/types';
import {Link} from 'react-router-dom';

const HomePage: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutResponse | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await workoutApi.getAll();
        if (response.status == 200 && response.data) {
          setWorkouts(response.data.data);
        }
      } catch (error) {
        console.error('获取训练记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentWorkout = async () => {
      try {
        const response = await workoutApi.getInProcess();
        if (response.status == 200 && response.data) {
          setCurrentWorkout(response.data.data);
        }
      } catch (error) {
        console.error('获取进行中训练失败:', error);
      }
    };

    fetchWorkouts();
    fetchCurrentWorkout();
  }, []);

  return (
    <Box sx={{mt: 2}}>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎回来
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardActionArea component={Link} to="/workouts">
              <CardContent>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <CalendarIcon sx={{fontSize: 40, mr: 2, color: '#1976d2'}}/>
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      训练次数
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

        <Grid item xs={12} sm={4}>
          <Card>
            <CardActionArea component={Link} to="/routines">
              <CardContent>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <FitnessCenterIcon sx={{fontSize: 40, mr: 2, color: '#43a047'}}/>
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      训练计划
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

        <Grid item xs={12} sm={4}>
          <Card>
            <CardActionArea component={Link} to="/workouts">
              <CardContent>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <TrendingUpIcon sx={{fontSize: 40, mr: 2, color: '#f57c00'}}/>
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      本月训练
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

      {/* 进行中的训练 */}
      <Paper elevation={3} sx={{p: 3, mb: 4}}>
        <Typography variant="h5" gutterBottom>
          当前训练
        </Typography>
        {loading ? (
          <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
            <CircularProgress/>
          </Box>
        ) : currentWorkout ? (
          <Box>
            <Typography variant="h6">
              {currentWorkout.routine?.name || '未命名训练'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              开始时间: {new Date(currentWorkout.startTime || '').toLocaleString()}
            </Typography>
            <Box sx={{mt: 2}}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/workouts/${currentWorkout.id}`}
              >
                查看详情
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            目前没有进行中的训练
          </Typography>
        )}
      </Paper>

      {/* 最近训练记录 */}
      <Paper elevation={3} sx={{p: 3}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
          <Typography variant="h5" gutterBottom>
            最近训练
          </Typography>
          <Button variant="outlined" component={Link} to="/workouts">
            查看全部
          </Button>
        </Box>

        {loading ? (
          <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
            <CircularProgress/>
          </Box>
        ) : workouts.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            暂无训练记录
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
                  '&:hover': {backgroundColor: '#f5f5f5'}
                }}
              >
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Typography variant="h6">
                    {workout.routine?.name || '未命名训练'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(workout.startTime || '').toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {workout.startTime ? new Date(workout.startTime).toLocaleTimeString() : ''} -
                  {workout.endTime ? new Date(workout.endTime).toLocaleTimeString() : '进行中'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HomePage;
