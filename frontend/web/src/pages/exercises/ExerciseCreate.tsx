import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import ExerciseForm, { type ExerciseFormData } from './ExerciseForm';
import { exerciseApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';

export default function ExerciseCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const handleSubmit = async (data: ExerciseFormData) => {
        try {
            await exerciseApi.create(data);
            notifications.show('Exercise created successfully', { severity: 'success' });
            navigate('/exercises');
        } catch (error) {
            console.error('Failed to create exercise:', error);
            notifications.show('Failed to create exercise', { severity: 'error' });
            throw error;
        }
    };

    return (
        <PageContainer
            title="Create Exercise"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Exercises', path: '/exercises' },
                { title: 'Create' },
            ]}
        >
            <ExerciseForm onSubmit={handleSubmit} />
        </PageContainer>
    );
}
