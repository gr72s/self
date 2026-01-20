import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  Alert,
  IconButton,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Toolbar,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { muscleApi } from '@/services/api';
import type { MuscleResponse } from '@/types';
import { useModuleState } from '@/context/AdminStateContext';

interface Muscle extends MuscleResponse {
  isNew?: boolean;
}

const MusclePage: React.FC = () => {
  const { state, dispatch } = useModuleState('muscles');
  
  const {
    data: muscles,
    loading,
    error,
    searchTerm,
    page,
    rowsPerPage,
    sortConfig,
    deleteDialogOpen,
    itemToDelete: muscleToDelete,
    editingId
  } = state;

  // 获取所有肌肉数据
  useEffect(() => {
    fetchMuscles();
  }, []);

  const fetchMuscles = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await muscleApi.getAll();
      if (response.status === 200 && response.data.success) {
        dispatch({ type: 'SET_DATA', payload: response.data.data });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '获取肌肉列表失败' });
      console.error('获取肌肉列表失败:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 添加新肌肉行
  const handleAddNew = () => {
    const newMuscle: Muscle = {
      id: Date.now(),
      name: '',
      description: '',
      isNew: true
    };
    dispatch({ type: 'ADD_ITEM', payload: newMuscle });
    dispatch({ type: 'SET_EDITING_ID', payload: newMuscle.id });
  };

  // 保存新肌肉
  const handleSave = async (muscle: Muscle) => {
    if (!muscle.name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: '肌肉名称不能为空' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await muscleApi.create({
        name: muscle.name,
        description: muscle.description
      });
      if (response.status === 200 && response.data.success) {
        await fetchMuscles();
        dispatch({ type: 'SET_EDITING_ID', payload: null });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '保存肌肉失败' });
      console.error('保存肌肉失败:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 取消编辑
  const handleCancel = (muscle: Muscle) => {
    if (muscle.isNew) {
      dispatch({ type: 'DELETE_ITEM', payload: muscle.id });
    }
    dispatch({ type: 'SET_EDITING_ID', payload: null });
  };

  // 处理输入变化
  const handleInputChange = (id: number, field: keyof Muscle, value: string) => {
    dispatch({ 
      type: 'UPDATE_ITEM', 
      payload: { id, data: { [field]: value } } 
    });
  };

  // 打开删除确认对话框
  const handleDeleteClick = (id: number) => {
    dispatch({ type: 'SET_ITEM_TO_DELETE', payload: id });
    dispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: true });
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (muscleToDelete === null) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await muscleApi.delete(muscleToDelete);
      if (response.status === 200 && response.data.success) {
        dispatch({ type: 'DELETE_ITEM', payload: muscleToDelete });
        dispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: false });
        dispatch({ type: 'SET_ITEM_TO_DELETE', payload: null });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '删除肌肉失败' });
      console.error('删除肌肉失败:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 取消删除
  const handleDeleteCancel = () => {
    dispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: false });
    dispatch({ type: 'SET_ITEM_TO_DELETE', payload: null });
  };

  // 排序功能
  const handleSort = (key: keyof Muscle) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    dispatch({ type: 'SET_SORT_CONFIG', payload: { key, direction } });
  };

  // 过滤功能
  const filteredMuscles = muscles.filter(muscle =>
    muscle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (muscle.description && muscle.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 排序逻辑
  const sortedMuscles = [...filteredMuscles].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // 分页逻辑
  const paginatedMuscles = sortedMuscles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 处理分页变化
  const handleChangePage = (_event: unknown, newPage: number) => {
    dispatch({ type: 'SET_PAGE', payload: newPage });
  };

  // 处理每页行数变化
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_ROWS_PER_PAGE', payload: parseInt(event.target.value, 10) });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          肌肉信息管理
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 工具栏 */}
      <Paper sx={{ mb: 3 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="搜索肌肉..."
            size="small"
            value={searchTerm}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            disabled={loading}
          >
            新增肌肉
          </Button>
        </Toolbar>
      </Paper>

      {/* 肌肉表格 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'id'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'name'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('name')}
                  >
                    肌肉名称
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'description'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('description')}
                  >
                    功能描述
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && muscles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedMuscles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    暂无肌肉数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMuscles.map((muscle) => (
                  <TableRow key={muscle.id} hover>
                    <TableCell>{muscle.id}</TableCell>
                    <TableCell>
                      {editingId === muscle.id ? (
                        <TextField
                          fullWidth
                          value={muscle.name}
                          onChange={(e) => handleInputChange(muscle.id, 'name', e.target.value)}
                          error={!muscle.name.trim()}
                          helperText={!muscle.name.trim() ? '肌肉名称不能为空' : ''}
                          size="small"
                          variant="outlined"
                          autoFocus
                        />
                      ) : (
                        muscle.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === muscle.id ? (
                        <TextField
                          fullWidth
                          value={muscle.description || ''}
                          onChange={(e) => handleInputChange(muscle.id, 'description', e.target.value)}
                          size="small"
                          variant="outlined"
                          multiline
                          maxRows={2}
                        />
                      ) : (
                        muscle.description || '-' 
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      {editingId === muscle.id ? (
                        <>
                          <Tooltip title="保存">
                            <IconButton
                              onClick={() => handleSave(muscle)}
                              disabled={!muscle.name.trim()}
                              color="success"
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="取消">
                            <IconButton onClick={() => handleCancel(muscle)} color="error">
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {!muscle.isNew && (
                            <Tooltip title="删除">
                              <IconButton
                                onClick={() => handleDeleteClick(muscle.id)}
                                color="error"
                                disabled={loading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 分页控件 */}
        <TablePagination
          component="div"
          count={filteredMuscles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="每页行数："
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </Paper>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            您确定要删除这条肌肉记录吗？此操作不可恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : '删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MusclePage;
