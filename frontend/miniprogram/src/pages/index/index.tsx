import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { workoutApi, userApi } from '@mini/services/api';
import type { WorkoutResponse } from '@/types';
import './index.scss';

export default function HomePage() {
    const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentWorkout, setCurrentWorkout] = useState<WorkoutResponse | null>(null);
    const [user, setUser] = useState<any>(null);

    useLoad(() => {
        console.log('HomePage loaded');
        fetchData();
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user
            try {
                const userResponse = await userApi.getCurrent();
                setUser((userResponse as any).data?.data || (userResponse as any).data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }

            // Fetch workouts
            try {
                const workoutResponse = await workoutApi.getAll();
                const data = (workoutResponse as any).data?.data || (workoutResponse as any).data || [];
                setWorkouts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch workouts:', error);
            }

            // Fetch current workout
            try {
                const currentResponse = await workoutApi.getInProcess();
                setCurrentWorkout((currentResponse as any).data?.data || (currentResponse as any).data);
            } catch (error) {
                console.error('Failed to fetch current workout:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (url: string) => {
        Taro.navigateTo({ url });
    };

    const thisMonthCount = workouts.filter(w => {
        const date = new Date(w.startTime || '');
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    const uniqueRoutines = new Set(workouts.map(w => w.routine?.id)).size;

    return (
        <View className="home-page">
            {/* Welcome */}
            <View className="welcome">
                <Text className="welcome-text">
                    Welcome back{user?.username ? `, ${user.username}` : ''}
                </Text>
            </View>

            {/* Stats Cards */}
            <View className="stats-grid">
                <View className="stat-card" onClick={() => navigateTo('/pages/workouts/list/index')}>
                    <View className="stat-icon calendar">📅</View>
                    <View className="stat-content">
                        <Text className="stat-label">Total Workouts</Text>
                        <Text className="stat-value">{workouts.length}</Text>
                    </View>
                </View>

                <View className="stat-card" onClick={() => navigateTo('/pages/routines/list/index')}>
                    <View className="stat-icon fitness">💪</View>
                    <View className="stat-content">
                        <Text className="stat-label">Routines Used</Text>
                        <Text className="stat-value">{uniqueRoutines}</Text>
                    </View>
                </View>

                <View className="stat-card">
                    <View className="stat-icon trend">📈</View>
                    <View className="stat-content">
                        <Text className="stat-label">This Month</Text>
                        <Text className="stat-value">{thisMonthCount}</Text>
                    </View>
                </View>
            </View>

            {/* Current Workout */}
            <View className="section">
                <Text className="section-title">Current Workout</Text>
                {loading ? (
                    <View className="loading">
                        <Text>Loading...</Text>
                    </View>
                ) : currentWorkout ? (
                    <View className="current-workout">
                        <Text className="workout-name">{currentWorkout.routine?.name || 'Unnamed Workout'}</Text>
                        <Text className="workout-time">
                            Started: {new Date(currentWorkout.startTime || '').toLocaleString()}
                        </Text>
                        <View className="button primary" onClick={() => navigateTo(`/pages/workouts/detail/index?id=${currentWorkout.id}`)}>
                            <Text className="button-text">View Details</Text>
                        </View>
                    </View>
                ) : (
                    <Text className="empty-text">No active workout</Text>
                )}
            </View>

            {/* Recent Activity */}
            <View className="section">
                <View className="section-header">
                    <Text className="section-title">Recent Activity</Text>
                    <Text className="link-text" onClick={() => navigateTo('/pages/workouts/list/index')}>
                        View All
                    </Text>
                </View>

                {loading ? (
                    <View className="loading">
                        <Text>Loading...</Text>
                    </View>
                ) : workouts.length === 0 ? (
                    <Text className="empty-text">No workout history</Text>
                ) : (
                    <View className="workout-list">
                        {workouts.slice(0, 5).map(workout => (
                            <View key={workout.id} className="workout-item">
                                <View className="workout-header">
                                    <Text className="workout-title">{workout.routine?.name || 'Unnamed Workout'}</Text>
                                    <Text className="workout-date">{new Date(workout.startTime || '').toLocaleDateString()}</Text>
                                </View>
                                <Text className="workout-time">
                                    {workout.startTime ? new Date(workout.startTime).toLocaleTimeString() : ''} -
                                    {workout.endTime ? new Date(workout.endTime).toLocaleTimeString() : 'In Progress'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}
