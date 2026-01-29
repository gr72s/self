import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@/components/dashboard/PageContainer';
import ExerciseForm, { type ExerciseFormData } from './ExerciseForm';
import { exerciseApi } from '@/services/api';
import useNotifications from '@/providers/useNotifications';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function ExerciseEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(true);
    const [initialData, setInitialData] = React.useState<ExerciseFormData | null>(null);

    React.useEffect(() => {
        const fetchExercise = async () => {
            if (!id) return;
            try {
                const response = await exerciseApi.getById(Number(id));
                const exercise = (response.data as any).data || response.data;
                setInitialData({
                    name: exercise.name,
                    originName: exercise.originName || '',
                    description: exercise.description || '',
                    cues: exercise.cues || [],
                    mainMuscles: exercise.mainMuscles ? exercise.mainMuscles.map((m: any) => m.id) : [],
                    supportMuscles: exercise.supportMuscles ? exercise.supportMuscles.map((m: any) => m.id) : [],
                });
            } catch (error) {
                console.error('Failed to fetch exercise:', error);
                notifications.show('Failed to fetch exercise details', { severity: 'error' });
                navigate('/exercises');
            } finally {
                setLoading(false);
            }
        };

        fetchExercise();
    }, [id, navigate, notifications]);

    const handleSubmit = async (data: ExerciseFormData) => {
        if (!id) return;
        try {
            await exerciseApi.update(Number(id), data);
            notifications.show('Exercise updated successfully', { severity: 'success' });
            navigate('/exercises');
        } catch (error) {
            console.error('Failed to update exercise:', error);
            notifications.show('Failed to update exercise', { severity: 'error' });
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
            title="Edit Exercise"
            breadcrumbs={[
                { title: 'Home', path: '/' },
                { title: 'Exercises', path: '/exercises' },
                { title: 'Edit' },
            ]}
        >
            {initialData && (
                <ExerciseForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    submitLabel="Update"
                />
            )}
        </PageContainer>
    );
}
