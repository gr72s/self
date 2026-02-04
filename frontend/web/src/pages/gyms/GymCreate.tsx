import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import GymForm, { type GymFormData } from './GymForm';
import { gymApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';

export default function GymCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const handleSubmit = async (data: GymFormData) => {
        try {
            await gymApi.create(data);
            notifications.show('Gym created successfully', { severity: 'success' });
            navigate('/gyms');
        } catch (error) {
            console.error('Failed to create gym:', error);
            notifications.show('Failed to create gym', { severity: 'error' });
        }
    };

    return (
        <PageContainer
            title="Create Gym"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Gyms', path: '/gyms' },
                { title: 'New' },
            ]}
        >
            <GymForm onSubmit={handleSubmit} submitLabel="Create Gym" />
        </PageContainer>
    );
}
