import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { exerciseApi } from '@/services/api';

interface Exercise {
  id: number;
  name: string;
  originName: string;
  description?: string;
  mainMuscles: Array<{ id: number; name: string }>;
  supportMuscles: Array<{ id: number; name: string }>;
  cues: string[];
}

const ExercisePage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    originName: '',
    description: '',
    mainMuscles: [] as number[],
    supportMuscles: [] as number[],
    cues: [] as string[]
  });

  // 获取所有动作
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await exerciseApi.getAll();
        if (response.status === 200 && response.data.success) {
          setExercises(response.data.data as Exercise[]);
        }
      } catch (err) {
        setError('获取动作列表失败');
        console.error('获取动作列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理表单提交
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await exerciseApi.create(formData);
      if (response.status === 200 && response.data.success) {
        // 关闭对话框并刷新列表
        setOpenDialog(false);
        // 重新获取动作列表
        const fetchResponse = await exerciseApi.getAll();
        if (fetchResponse.status === 200 && fetchResponse.data.success) {
          setExercises(fetchResponse.data.data as Exercise[]);
        }
      }
    } catch (err) {
      setError('创建动作失败');
      console.error('创建动作失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          动作管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          创建动作
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>动作名称</TableCell>
                <TableCell>原始名称</TableCell>
                <TableCell>描述</TableCell>
                <TableCell>主要肌肉</TableCell>
                <TableCell>辅助肌肉</TableCell>
                <TableCell>提示</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : exercises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                    暂无动作数据
                  </TableCell>
                </TableRow>
              ) : (
                exercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>{exercise.id}</TableCell>
                    <TableCell>{exercise.name}</TableCell>
                    <TableCell>{exercise.originName}</TableCell>
                    <TableCell>{exercise.description || '-'}</TableCell>
                    <TableCell>
                      {exercise.mainMuscles.map(muscle => muscle.name).join(', ')}
                    </TableCell>
                    <TableCell>
                      {exercise.supportMuscles.map(muscle => muscle.name).join(', ')}
                    </TableCell>
                    <TableCell>
                      {exercise.cues.join(', ')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 创建动作对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建动作</DialogTitle>
        <DialogContent>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="动作名称"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="原始名称"
                    name="originName"
                    value={formData.originName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="描述"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExercisePage;
