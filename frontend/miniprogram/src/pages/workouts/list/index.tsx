import { View, Text, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useWorkoutList } from '@/hooks/useWorkoutList';
import { workoutApi } from '@mini/services/api';
import './index.scss';

export default function WorkoutList() {
    const { workouts, loading, deleteWorkout, fetchWorkouts } = useWorkoutList({
        workoutApi,
        onError: (msg) => Taro.showToast({ title: msg, icon: 'error' }),
        onSuccess: (msg) => Taro.showToast({ title: msg, icon: 'success' }),
    });

    useLoad(() => {
        console.log('WorkoutList loaded');
    });

    const handleDelete = async (id: number, name: string) => {
        const res = await Taro.showModal({
            title: '确认删除',
            content: `确定要删除训练"${name}"吗？`,
            confirmText: '删除',
            cancelText: '取消'
        });

        if (res.confirm) {
            await deleteWorkout(id);
        }
    };

    const navigateToCreate = () => {
        Taro.navigateTo({ url: '/pages/workouts/create/index' });
    };

    const navigateToEdit = (id: number) => {
        Taro.navigateTo({ url: `/pages/workouts/edit/index?id=${id}` });
    };

    return (
        <View className="workout-list-page">
            {/* Header with Add Button */}
            <View className="page-header">
                <Text className="page-title">训练记录</Text>
                <Button className="add-button" onClick={navigateToCreate}>
                    ➕ 新建
                </Button>
            </View>

            {/* Workout List */}
            {loading ? (
                <View className="loading">
                    <Text>加载中...</Text>
                </View>
            ) : workouts.length === 0 ? (
                <View className="empty">
                    <Text className="empty-text">暂无训练记录</Text>
                    <Button className="primary-button" onClick={navigateToCreate}>
                        创建第一个训练
                    </Button>
                </View>
            ) : (
                <View className="list">
                    {workouts.map(workout => (
                        <View key={workout.id} className="workout-card">
                            <View className="card-header">
                                <Text className="workout-name">{workout.routine?.name || '未命名训练'}</Text>
                                <Text className="workout-id">#{workout.id}</Text>
                            </View>

                            <View className="card-body">
                                <View className="info-row">
                                    <Text className="label">开始时间:</Text>
                                    <Text className="value">
                                        {workout.startTime ? new Date(workout.startTime).toLocaleString() : '-'}
                                    </Text>
                                </View>

                                <View className="info-row">
                                    <Text className="label">结束时间:</Text>
                                    <Text className="value">
                                        {workout.endTime ? new Date(workout.endTime).toLocaleString() : '进行中'}
                                    </Text>
                                </View>

                                <View className="info-row">
                                    <Text className="label">地点:</Text>
                                    <Text className="value">{workout.gym?.name || '-'}</Text>
                                </View>

                                {workout.note && (
                                    <View className="note">
                                        <Text className="note-text">{workout.note}</Text>
                                    </View>
                                )}
                            </View>

                            <View className="card-actions">
                                <Button
                                    className="action-button edit"
                                    onClick={() => navigateToEdit(workout.id)}
                                >
                                    编辑
                                </Button>
                                <Button
                                    className="action-button delete"
                                    onClick={() => handleDelete(workout.id, workout.routine?.name || '未命名训练')}
                                >
                                    删除
                                </Button>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
