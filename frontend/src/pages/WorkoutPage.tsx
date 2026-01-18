import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { workoutApi } from '@/services/api';
import type { WorkoutResponse } from '@/types';
import { Link } from 'react-router-dom';

const WorkoutPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchWorkouts();
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          训练记录
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/workouts/new">
          开始新训练
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : workouts.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            暂无训练记录
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/workouts/new" 
            sx={{ mt: 2 }}
          >
            开始第一个训练
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="训练记录表格">
            <TableHead>
              <TableRow>
                <TableCell>训练名称</TableCell>
                <TableCell>开始时间</TableCell>
                <TableCell>结束时间</TableCell>
                <TableCell>时长</TableCell>
                <TableCell>场所</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.map((workout) => {
                const startTime = workout.startTime ? new Date(workout.startTime) : null;
                const endTime = workout.endTime ? new Date(workout.endTime) : null;
                const duration = startTime && endTime ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) : null;
                
                return (
                  <TableRow
                    key={workout.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {workout.routine?.name || '未命名训练'}
                    </TableCell>
                    <TableCell>
                      {startTime ? startTime.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {endTime ? endTime.toLocaleString() : '进行中'}
                    </TableCell>
                    <TableCell>
                      {duration ? `${duration} 分钟` : '-'}
                    </TableCell>
                    <TableCell>
                      {workout.gym.name}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="查看">
                        <IconButton component={Link} to={`/workouts/${workout.id}`} color="primary" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="编辑">
                        <IconButton component={Link} to={`/workouts/${workout.id}/edit`} color="primary" size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default WorkoutPage;
