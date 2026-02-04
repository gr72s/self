import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import WorkoutForm, { type WorkoutFormData } from './WorkoutForm';
import { workoutApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';

export default function WorkoutEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(true);
    const [initialData, setInitialData] = React.useState<WorkoutFormData | null>(null);

    React.useEffect(() => {
        const fetchWorkout = async () => {
            if (!id) return;
            try {
                const response = await workoutApi.getById(Number(id));
                const workout = (response.data as any).data || response.data;
                setInitialData({
                    startTime: workout.startTime ? dayjs(workout.startTime) : null,
                    gymId: workout.gym ? workout.gym.id : null,
                    note: workout.note || '',
                });
            } catch (error) {
                console.error('Failed to fetch workout:', error);
                notifications.show('Failed to fetch workout details', { severity: 'error' });
                navigate('/workouts');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [id, navigate, notifications]);

    const handleSubmit = async (data: WorkoutFormData) => {
        if (!id) return;
        try {
            const payload = {
                startTime: data.startTime?.format('YYYY-MM-DD HH:mm'),
                gym: data.gymId,
                note: data.note,
                target: [], // Assuming target isn't edited here for now, or existing logic needs to be preserved
                routine: null // Same for routine
            };
            // Note: Update API might need different payload structure depending on backend
            await workoutApi.update(Number(id), payload);
            notifications.show('Workout updated successfully', { severity: 'success' });
            navigate('/workouts');
        } catch (error) {
            console.error('Failed to update workout:', error);
            notifications.show('Failed to update workout', { severity: 'error' });
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
            title="Edit Workout"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Workouts', path: '/workouts' },
                { title: 'Edit' },
            ]}
        >
            {initialData && (
                <WorkoutForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    submitLabel="Update Workout"
                />
            )}
        </PageContainer>
    );
}
