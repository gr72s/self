import * as React from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import PageContainer from '@web/components/dashboard/PageContainer';
import { gymApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';
import { useDialogs } from '@web/providers/useDialogs';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';

export default function GymList() {
    const [rows, setRows] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const navigate = useNavigate();

    const fetchGyms = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await gymApi.getAll();
            // Adjust depending on actual API response structure (likely response.data.data for success wrapper)
            const data = (response.data as any).data || response.data;
            // Ensure data is array
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch gyms:', error);
            notifications.show('Failed to fetch gyms', { severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [notifications]);

    React.useEffect(() => {
        fetchGyms();
    }, [fetchGyms]);

    const handleDelete = async (id: number) => {
        const confirmed = await dialogs.confirm('Are you sure you want to delete this gym?', {
            okText: 'Delete',
            severity: 'error',
        });
        if (confirmed) {
            try {
                await gymApi.delete(id);
                notifications.show('Gym deleted successfully', { severity: 'success' });
                fetchGyms();
            } catch (error) {
                console.error('Failed to delete gym:', error);
                notifications.show('Failed to delete gym', { severity: 'error' });
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'location', headerName: 'Location', width: 200 },
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
                        to={`/gyms/${params.row.id}/edit`}
                        onClick={(e) => e.stopPropagation()} // Prevent row click
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
            title="Gyms"
            breadcrumbs={[{ title: 'Home', path: '/' }, { title: 'Gyms' }]}
            actions={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/gyms/new"
                >
                    Add Gym
                </Button>
            }
        >
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                onRowClick={(params) => navigate(`/gyms/${params.row.id}/edit`)} // Or view page if exists
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
