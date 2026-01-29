import React, { useState, useEffect } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Button, IconButton, Stack } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { routineApi } from '@/services/api';
import type { RoutineResponse } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/dashboard/PageContainer';
import useNotifications from '@/providers/useNotifications';
import { useDialogs } from '@/providers/useDialogs';

const RoutinePage: React.FC = () => {
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const notifications = useNotifications();
  const dialogs = useDialogs();
  const navigate = useNavigate();

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const response = await routineApi.getAll();
      if (response.status === 200 && response.data) {
        setRoutines((response.data as any).data || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      notifications.show('Failed to fetch routines', { severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm('Are you sure you want to delete this routine?', {
      okText: 'Delete',
      severity: 'error',
    });
    if (confirmed) {
      try {
        await routineApi.delete(id);
        notifications.show('Routine deleted successfully', { severity: 'success' });
        fetchRoutines();
      } catch (error) {
        console.error('Failed to delete routine:', error);
        notifications.show('Failed to delete routine', { severity: 'error' });
      }
    }
  };

  // Helper handling Category display if needed, but for list view usually just basic info
  // Map Slot categories? Maybe too complex for a grid cell. Just showing slot count.

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 300, flex: 1 },
    // { field: 'slots', headerName: 'Exercises', width: 120, valueGetter: (params) => params.row.slots?.size || 0 }, // Adjust based on data structure
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            component={Link}
            to={`/routines/${params.row.id}`}
            title="View Details"
            onClick={(e) => e.stopPropagation()}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            component={Link}
            to={`/routines/${params.row.id}/edit`}
            title="Edit"
            onClick={(e) => e.stopPropagation()}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <PageContainer
      title="Routines"
      breadcrumbs={[{ title: 'Home', path: '/' }, { title: 'Routines' }]}
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/routines/new"
        >
          Create Routine
        </Button>
      }
    >
      <DataGrid
        rows={routines}
        columns={columns}
        loading={loading}
        onRowClick={(params) => navigate(`/routines/${params.row.id}`)}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        sx={{ border: 0 }}
        disableRowSelectionOnClick
      />
    </PageContainer>
  );
};

export default RoutinePage;
