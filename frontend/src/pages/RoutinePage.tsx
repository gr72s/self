import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Paper, Chip } from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';
import { routineApi } from '@/services/api';
import type { RoutineResponse } from '@/types';
import { Category } from '@/types';
import { Link } from 'react-router-dom';

const RoutinePage: React.FC = () => {
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await routineApi.getAll();
        if (response.status == 200 && response.data) {
          setRoutines(response.data.data);
        }
      } catch (error) {
        console.error('获取训练计划失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  // 获取分类中文名称
  const getCategoryName = (category: Category): string => {
    const categoryMap: Record<Category, string> = {
      [Category.Mobility]: '柔韧性',
      [Category.WarmUp]: '热身',
      [Category.Activation]: '激活',
      [Category.WorkingSets]: '正式组',
      [Category.Corrective]: '纠正性',
      [Category.Aerobic]: '有氧',
      [Category.CoolDown]: '放松'
    };
    return categoryMap[category];
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          训练计划
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link} 
          to="/routines/new"
        >
          创建新计划
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : routines.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            暂无训练计划
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/routines/new" 
            sx={{ mt: 2 }}
          >
            创建第一个计划
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {routines.map((routine) => {
            // 统计不同分类的动作数量
            const categoryCounts: Record<string, number> = {};
            routine.slots.forEach(slot => {
              const categoryName = getCategoryName(slot.category);
              categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
            });

            return (
              <Grid item xs={12} sm={6} md={4} key={routine.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {routine.name}
                    </Typography>
                    {routine.description && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {routine.description}
                      </Typography>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        动作分类:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(categoryCounts).map(([category, count]) => (
                          <Chip key={category} label={`${category}: ${count}`} size="small" />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      总动作数: {routine.slots.size}
                    </Typography>
                    {routine.checklist.length > 0 && (
                      <Typography variant="body2" color="textSecondary">
                        检查项: {routine.checklist.length}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', justifyContent: 'flex-start', p: 2 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<VisibilityIcon />}
                      component={Link} 
                      to={`/routines/${routine.id}`}
                    >
                      查看详情
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<EditIcon />}
                      component={Link} 
                      to={`/routines/${routine.id}/edit`}
                    >
                      编辑
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default RoutinePage;
