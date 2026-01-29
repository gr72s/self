import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/dashboard/PageContainer';
import MuscleForm, { type MuscleFormData } from './MuscleForm';
import { muscleApi } from '@/services/api';
import useNotifications from '@/providers/useNotifications';

export default function MuscleCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const handleSubmit = async (data: MuscleFormData) => {
        try {
            await muscleApi.create(data);
            notifications.show('Muscle created successfully', { severity: 'success' });
            navigate('/muscles');
        } catch (error) {
            console.error('Failed to create muscle:', error);
            notifications.show('Failed to create muscle', { severity: 'error' });
            throw error;
        }
    };

    return (
        <PageContainer
            title="Create Muscle"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Muscles', path: '/muscles' },
                { title: 'Create' },
            ]}
        >
            <MuscleForm onSubmit={handleSubmit} />
        </PageContainer>
    );
}
