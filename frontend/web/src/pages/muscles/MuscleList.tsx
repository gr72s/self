import * as React from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import PageContainer from '@web/components/dashboard/PageContainer';
import { muscleApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';
import { useDialogs } from '@web/providers/useDialogs';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';

export default function MuscleList() {
    const [rows, setRows] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const navigate = useNavigate();

    const fetchMuscles = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await muscleApi.getAll();
            const data = (response.data as any).data || response.data;
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch muscles:', error);
            notifications.show('Failed to fetch muscles', { severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [notifications]);

    React.useEffect(() => {
        fetchMuscles();
    }, [fetchMuscles]);

    const handleDelete = async (id: number) => {
        const confirmed = await dialogs.confirm('Are you sure you want to delete this muscle?', {
            okText: 'Delete',
            severity: 'error',
        });
        if (confirmed) {
            try {
                await muscleApi.delete(id);
                notifications.show('Muscle deleted successfully', { severity: 'success' });
                fetchMuscles();
            } catch (error) {
                console.error('Failed to delete muscle:', error);
                notifications.show('Failed to delete muscle', { severity: 'error' });
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'originName', headerName: 'Origin Name', width: 200 },
        { field: 'function', headerName: 'Function', width: 200 },
        { field: 'description', headerName: 'Description', width: 300, flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        component={Link}
                        to={`/muscles/${params.row.id}/edit`}
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
            title="Muscles"
            breadcrumbs={[{ title: 'Home', path: '/' }, { title: 'Muscles' }]}
            actions={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/muscles/new"
                >
                    Add Muscle
                </Button>
            }
        >
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                onRowClick={(params) => navigate(`/muscles/${params.row.id}/edit`)}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                sx={{ border: 0 }}
                disableRowSelectionOnClick
            />
        </PageContainer>
    );
}
