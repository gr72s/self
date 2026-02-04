import React, { useState, useEffect } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Button, IconButton, Stack } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { workoutApi } from '@web/services/api';
import type { WorkoutResponse } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import useNotifications from '@web/providers/useNotifications';
import { useDialogs } from '@web/providers/useDialogs';

const WorkoutList: React.FC = () => {
    const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const navigate = useNavigate();

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const response = await workoutApi.getAll();
            if (response.status === 200 && response.data) {
                setWorkouts((response.data as any).data || response.data);
            }
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
            notifications.show('Failed to fetch workouts', { severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmed = await dialogs.confirm('Are you sure you want to delete this workout?', {
            okText: 'Delete',
            severity: 'error',
        });
        if (confirmed) {
            try {
                await workoutApi.delete(id);
                notifications.show('Workout deleted successfully', { severity: 'success' });
                fetchWorkouts();
            } catch (error) {
                console.error('Failed to delete workout:', error);
                notifications.show('Failed to delete workout', { severity: 'error' });
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'routineName',
            headerName: 'Routine',
            width: 200,
            valueGetter: (_value, row) => row.routine?.name || 'Unnamed'
        },
        {
            field: 'startTime',
            headerName: 'Started',
            width: 200,
            valueFormatter: (_value, row) => row.startTime ? new Date(row.startTime).toLocaleString() : '-'
        },
        {
            field: 'endTime',
            headerName: 'Ended',
            width: 200,
            valueFormatter: (_value, row) => row.endTime ? new Date(row.endTime).toLocaleString() : 'In Progress'
        },
        {
            field: 'gymName',
            headerName: 'Location',
            width: 150,
            valueGetter: (_value, row) => row.gym?.name || '-'
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        component={Link}
                        to={`/workouts/${params.row.id}`}
                        title="View Details"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        component={Link}
                        to={`/workouts/${params.row.id}/edit`}
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
            title="Workouts"
            breadcrumbs={[{ title: 'Home', path: '/' }, { title: 'Workouts' }]}
            actions={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/workouts/new"
                >
                    New Workout
                </Button>
            }
        >
            <DataGrid
                rows={workouts}
                columns={columns}
                loading={loading}
                onRowClick={(params) => navigate(`/workouts/${params.row.id}`)}
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

export default WorkoutList;
