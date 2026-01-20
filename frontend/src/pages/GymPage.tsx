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
import { gymApi } from '@/services/api';
import type { GymResponse } from '@/types';
import { useModuleState } from '@/context/AdminStateContext';

interface Gym extends GymResponse {
  isNew?: boolean;
}

const GymPage: React.FC = () => {
  const { state, dispatch } = useModuleState('gyms');
  
  const {
    data: gyms,
    loading,
    error,
    searchTerm,
    page,
    rowsPerPage,
    sortConfig,
    deleteDialogOpen,
    itemToDelete: gymToDelete,
    editingId
  } = state;

  // 获取所有健身场所数据
  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await gymApi.getAll();
      if (response.status === 200 && response.data.success) {
        dispatch({ type: 'SET_DATA', payload: response.data.data });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '获取健身场所列表失败' });
      console.error('获取健身场所列表失败:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 添加新健身场所行
  const handleAddNew = () => {
    const newGym: Gym = {
      id: Date.now(),
      name: '',
      description: '',
      isNew: true
    };
    dispatch({ type: 'ADD_ITEM', payload: newGym });
    dispatch({ type: 'SET_EDITING_ID', payload: newGym.id });
  };

  // 保存新健身场所
  const handleSave = async (gym: Gym) => {
    if (!gym.name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: '健身场所名称不能为空' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await gymApi.create({
        name: gym.name,
        description: gym.description
      });
      if (response.status === 200 && response.data.success) {
        await fetchGyms();
        dispatch({ type: 'SET_EDITING_ID', payload: null });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '保存健身场所失败' });
      console.error('保存健身场所失败:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 取消编辑
  const handleCancel = (gym: Gym) => {
    if (gym.isNew) {
      dispatch({ type: 'DELETE_ITEM', payload: gym.id });
    }
    dispatch({ type: 'SET_EDITING_ID', payload: null });
  };

  // 处理输入变化
  const handleInputChange = (id: number, field: keyof Gym, value: string) => {
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
    if (gymToDelete === null) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await gymApi.delete(gymToDelete);
      if (response.status === 200 && response.data.success) {
        dispatch({ type: 'DELETE_ITEM', payload: gymToDelete });
        dispatch({ type: 'SET_DELETE_DIALOG_OPEN', payload: false });
        dispatch({ type: 'SET_ITEM_TO_DELETE', payload: null });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '删除健身场所失败' });
      console.error('删除健身场所失败:', err);
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
  const handleSort = (key: keyof Gym) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    dispatch({ type: 'SET_SORT_CONFIG', payload: { key, direction } });
  };

  // 过滤功能
  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (gym.description && gym.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 排序逻辑
  const sortedGyms = [...filteredGyms].sort((a, b) => {
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
  const paginatedGyms = sortedGyms.slice(
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
          健身场所管理
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
            placeholder="搜索健身场所..."
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
            新增健身场所
          </Button>
        </Toolbar>
      </Paper>

      {/* 健身场所表格 */}
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
                    名称
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'description'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('description')}
                  >
                    位置描述
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && gyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedGyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    暂无健身场所数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGyms.map((gym) => (
                  <TableRow key={gym.id} hover>
                    <TableCell>{gym.id}</TableCell>
                    <TableCell>
                      {editingId === gym.id ? (
                        <TextField
                          fullWidth
                          value={gym.name}
                          onChange={(e) => handleInputChange(gym.id, 'name', e.target.value)}
                          error={!gym.name.trim()}
                          helperText={!gym.name.trim() ? '健身场所名称不能为空' : ''}
                          size="small"
                          variant="outlined"
                          autoFocus
                        />
                      ) : (
                        gym.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === gym.id ? (
                        <TextField
                          fullWidth
                          value={gym.description || ''}
                          onChange={(e) => handleInputChange(gym.id, 'description', e.target.value)}
                          size="small"
                          variant="outlined"
                          multiline
                          maxRows={2}
                        />
                      ) : (
                        gym.description || '-' 
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      {editingId === gym.id ? (
                        <>
                          <Tooltip title="保存">
                            <IconButton
                              onClick={() => handleSave(gym)}
                              disabled={!gym.name.trim()}
                              color="success"
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="取消">
                            <IconButton onClick={() => handleCancel(gym)} color="error">
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {!gym.isNew && (
                            <Tooltip title="删除">
                              <IconButton
                                onClick={() => handleDeleteClick(gym.id)}
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
          count={filteredGyms.length}
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
            您确定要删除这条健身场所记录吗？此操作不可恢复。
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

export default GymPage;
