import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@/components/dashboard/PageContainer';
import MuscleForm, { type MuscleFormData } from './MuscleForm';
import { muscleApi } from '@/services/api';
import useNotifications from '@/providers/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function MuscleEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(true);
    const [initialData, setInitialData] = React.useState<MuscleFormData | null>(null);

    React.useEffect(() => {
        const fetchMuscle = async () => {
            if (!id) return;
            try {
                const response = await muscleApi.getById(Number(id));
                const muscle = (response.data as any).data || response.data;
                setInitialData({
                    name: muscle.name,
                    description: muscle.description || '',
                });
            } catch (error) {
                console.error('Failed to fetch muscle:', error);
                notifications.show('Failed to fetch muscle details', { severity: 'error' });
                navigate('/muscles');
            } finally {
                setLoading(false);
            }
        };

        fetchMuscle();
    }, [id, navigate, notifications]);

    const handleSubmit = async (data: MuscleFormData) => {
        if (!id) return;
        try {
            await muscleApi.update(Number(id), data);
            notifications.show('Muscle updated successfully', { severity: 'success' });
            navigate('/muscles');
        } catch (error) {
            console.error('Failed to update muscle:', error);
            notifications.show('Failed to update muscle', { severity: 'error' });
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
            title="Edit Muscle"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Muscles', path: '/muscles' },
                { title: 'Edit' },
            ]}
        >
            {initialData && (
                <MuscleForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    submitLabel="Update"
                />
            )}
        </PageContainer>
    );
}
