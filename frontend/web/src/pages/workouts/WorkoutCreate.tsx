import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import WorkoutForm, { type WorkoutFormData } from './WorkoutForm';
import { workoutApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';

export default function WorkoutCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const handleSubmit = async (data: WorkoutFormData) => {
        try {
            const payload = {
                startTime: data.startTime?.format('YYYY-MM-DD HH:mm'),
                gym: data.gymId,
                note: data.note,
                target: [], // Default empty target
                routine: null // Default no routine
            };
            await workoutApi.create(payload);
            notifications.show('Workout started successfully', { severity: 'success' });
            navigate('/workouts');
        } catch (error) {
            console.error('Failed to create workout:', error);
            notifications.show('Failed to create workout', { severity: 'error' });
            throw error;
        }
    };

    return (
        <PageContainer
            title="Start New Workout"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Workouts', path: '/workouts' },
                { title: 'New' },
            ]}
        >
            <WorkoutForm onSubmit={handleSubmit} />
        </PageContainer>
    );
}
