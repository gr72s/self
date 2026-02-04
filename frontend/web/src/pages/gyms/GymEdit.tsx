import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import GymForm, { type GymFormData } from './GymForm';
import { gymApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function GymEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(true);
    const [initialData, setInitialData] = React.useState<GymFormData | undefined>(undefined);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const response = await gymApi.getById(id);
                // Assuming response.data.data contains the gym object. Adjust based on actual API structure.
                const gym: any = (response.data as any).data || response.data;
                setInitialData({
                    name: gym.name,
                    description: gym.description || '',
                    location: gym.location || '',
                });
            } catch (error) {
                console.error('Failed to fetch gym:', error);
                notifications.show('Failed to load gym details', { severity: 'error' });
                navigate('/gyms');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, notifications]);

    const handleSubmit = async (data: GymFormData) => {
        if (!id) return;
        try {
            await gymApi.update(id, data);
            notifications.show('Gym updated successfully', { severity: 'success' });
            navigate('/gyms');
        } catch (error) {
            console.error('Failed to update gym:', error);
            notifications.show('Failed to update gym', { severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageContainer
            title="Edit Gym"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Gyms', path: '/gyms' },
                { title: 'Edit' },
            ]}
        >
            <GymForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Update Gym" />
        </PageContainer>
    );
}
