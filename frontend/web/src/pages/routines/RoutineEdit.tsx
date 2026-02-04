import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import RoutineForm, { type RoutineFormData } from './RoutineForm';
import { routineApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function RoutineEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(true);
    const [initialData, setInitialData] = React.useState<RoutineFormData | null>(null);

    React.useEffect(() => {
        const fetchRoutine = async () => {
            if (!id) return;
            try {
                const response = await routineApi.getById(Number(id));
                const routine = (response.data as any).data || response.data;
                setInitialData({
                    name: routine.name,
                    description: routine.description || '',
                    note: routine.note || '',
                });
            } catch (error) {
                console.error('Failed to fetch routine:', error);
                notifications.show('Failed to fetch routine details', { severity: 'error' });
                navigate('/routines');
            } finally {
                setLoading(false);
            }
        };

        fetchRoutine();
    }, [id, navigate, notifications]);

    const handleSubmit = async (data: RoutineFormData) => {
        if (!id) return;
        try {
            await routineApi.update(Number(id), data);
            notifications.show('Routine updated successfully', { severity: 'success' });
            navigate('/routines');
        } catch (error) {
            console.error('Failed to update routine:', error);
            notifications.show('Failed to update routine', { severity: 'error' });
            throw error;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageContainer
            title="Edit Routine"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Routines', path: '/routines' },
                { title: 'Edit' },
            ]}
        >
            {initialData && (
                <RoutineForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    submitLabel="Update Routine"
                />
            )}
        </PageContainer>
    );
}
