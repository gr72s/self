// Shared business logic for workout list management
// Can be used by both Web and Miniprogram with platform-specific callbacks

import { useState, useEffect } from 'react';
import type { WorkoutResponse } from '@/types';

export interface UseWorkoutListProps {
    workoutApi: {
        getAll: () => Promise<{ data: WorkoutResponse[] }>;
        delete: (id: number) => Promise<any>;
    };
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

export interface UseWorkoutListReturn {
    workouts: WorkoutResponse[];
    loading: boolean;
    fetchWorkouts: () => Promise<void>;
    deleteWorkout: (id: number) => Promise<boolean>;
}

/**
 * Shared hook for workout list management
 * Abstracts business logic from UI implementation
 */
export const useWorkoutList = ({
    workoutApi,
    onError,
    onSuccess,
}: UseWorkoutListProps): UseWorkoutListReturn => {
    const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const response = await workoutApi.getAll();
            // Handle both direct data and nested data formats
            const data = (response as any).data?.data || (response as any).data || response;
            setWorkouts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
            onError('Failed to fetch workouts');
        } finally {
            setLoading(false);
        }
    };

    const deleteWorkout = async (id: number): Promise<boolean> => {
        try {
            await workoutApi.delete(id);
            onSuccess('Workout deleted successfully');
            await fetchWorkouts();
            return true;
        } catch (error) {
            console.error('Failed to delete workout:', error);
            onError('Failed to delete workout');
            return false;
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    return {
        workouts,
        loading,
        fetchWorkouts,
        deleteWorkout,
    };
};
