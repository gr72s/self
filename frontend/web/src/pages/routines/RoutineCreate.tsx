import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@web/components/dashboard/PageContainer';
import RoutineForm, { type RoutineFormData } from './RoutineForm';
import { routineApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';

export default function RoutineCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const handleSubmit = async (data: RoutineFormData) => {
        try {
            await routineApi.create(data);
            notifications.show('Routine created successfully', { severity: 'success' });
            navigate('/routines');
        } catch (error) {
            console.error('Failed to create routine:', error);
            notifications.show('Failed to create routine', { severity: 'error' });
            throw error;
        }
    };

    return (
        <PageContainer
            title="Create New Routine"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Routines', path: '/routines' },
                { title: 'New' },
            ]}
        >
            <RoutineForm onSubmit={handleSubmit} />
        </PageContainer>
    );
}
