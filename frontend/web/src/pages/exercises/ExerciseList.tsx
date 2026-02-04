import * as React from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import PageContainer from '@web/components/dashboard/PageContainer';
import { exerciseApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';
import { useDialogs } from '@web/providers/useDialogs';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

export default function ExerciseList() {
    const [rows, setRows] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const navigate = useNavigate();

    const fetchExercises = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await exerciseApi.getAll();
            const data = (response.data as any).data || response.data;
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch exercises:', error);
            notifications.show('Failed to fetch exercises', { severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [notifications]);

    React.useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    const handleDelete = async (id: number) => {
        const confirmed = await dialogs.confirm('Are you sure you want to delete this exercise?', {
            okText: 'Delete',
            severity: 'error',
        });
        if (confirmed) {
            try {
                await exerciseApi.delete(id);
                notifications.show('Exercise deleted successfully', { severity: 'success' });
                fetchExercises();
            } catch (error) {
                console.error('Failed to delete exercise:', error);
                notifications.show('Failed to delete exercise', { severity: 'error' });
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'originName', headerName: 'Origin Name', width: 150 },
        {
            field: 'mainMuscles',
            headerName: 'Main Muscles',
            width: 200,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto' }}>
                    {Array.isArray(params.value) && params.value.map((m: any) => (
                        <Chip key={m.id} label={m.name} size="small" />
                    ))}
                </Stack>
            )
        },
        {
            field: 'supportMuscles',
            headerName: 'Support Muscles',
            width: 200,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto' }}>
                    {Array.isArray(params.value) && params.value.map((m: any) => (
                        <Chip key={m.id} label={m.name} size="small" variant="outlined" />
                    ))}
                </Stack>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        component={Link}
                        to={`/exercises/${params.row.id}/edit`}
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
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    return (
        <PageContainer
            title="Exercises"
            breadcrumbs={[{ title: 'Home', path: '/' }, { title: 'Exercises' }]}
            actions={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/exercises/new"
                >
                    Add Exercise
                </Button>
            }
        >
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                onRowClick={(params) => navigate(`/exercises/${params.row.id}/edit`)}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                sx={{ border: 0 }}
                disableRowSelectionOnClick
                rowHeight={60}
            />
        </PageContainer>
    );
}
