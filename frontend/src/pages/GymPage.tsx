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
import { gymApi } from '@/services/api';

interface Gym {
  id: number;
  name: string;
  location: string;
}

const GymPage: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  // 获取所有健身场所
  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await gymApi.getAll();
        if (response.status === 200 && response.data.success) {
          setGyms(response.data.data as Gym[]);
        }
      } catch (err) {
        setError('获取健身场所列表失败');
        console.error('获取健身场所列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
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
      const response = await gymApi.create(formData);
      if (response.status === 200 && response.data.success) {
        // 关闭对话框并刷新列表
        setOpenDialog(false);
        // 重新获取健身场所列表
        const fetchResponse = await gymApi.getAll();
        if (fetchResponse.status === 200 && fetchResponse.data.success) {
          setGyms(fetchResponse.data.data as Gym[]);
        }
        // 重置表单
        setFormData({ name: '', location: '' });
      }
    } catch (err) {
      setError('创建健身场所失败');
      console.error('创建健身场所失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          健身场所管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          创建健身场所
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
                <TableCell>名称</TableCell>
                <TableCell>位置</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : gyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                    暂无健身场所数据
                  </TableCell>
                </TableRow>
              ) : (
                gyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell>{gym.id}</TableCell>
                    <TableCell>{gym.name}</TableCell>
                    <TableCell>{gym.location}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 创建健身场所对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建健身场所</DialogTitle>
        <DialogContent>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="名称"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="位置"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            // 重置表单
            setFormData({ name: '', location: '' });
          }}>
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

export default GymPage;
