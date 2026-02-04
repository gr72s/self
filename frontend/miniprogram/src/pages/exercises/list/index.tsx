import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { exerciseApi } from '@mini/services/api';
import type { ExerciseResponse } from '@/types';
import '../list.scss';

export default function ExerciseList() {
    const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useLoad(() => {
        fetchExercises();
    });

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const response = await exerciseApi.getAll();
            const data = (response as any).data?.data || (response as any).data || [];
            setExercises(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch exercises:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const res = await Taro.showModal({
            title: '确认删除',
            content: `确定要删除动作"${name}"吗？`,
            confirmText: '删除',
            cancelText: '取消'
        });

        if (res.confirm) {
            try {
                await exerciseApi.delete(id);
                Taro.showToast({ title: '删除成功', icon: 'success' });
                fetchExercises();
            } catch (error) {
                Taro.showToast({ title: '删除失败', icon: 'error' });
            }
        }
    };

    return (
        <View className="list-page">
            <View className="page-header">
                <Text className="page-title">训练动作</Text>
                <View
                    className="add-button"
                    onClick={() => Taro.navigateTo({ url: '/pages/exercises/create/index' })}
                >
                    <Text>➕ 新建</Text>
                </View>
            </View>

            {loading ? (
                <View className="loading"><Text>加载中...</Text></View>
            ) : exercises.length === 0 ? (
                <View className="empty"><Text className="empty-text">暂无训练动作</Text></View>
            ) : (
                <View className="list">
                    {exercises.map(exercise => (
                        <View key={exercise.id} className="item-card">
                            <View className="card-header">
                                <Text className="item-name">{exercise.name}</Text>
                                <Text className="item-id">#{exercise.id}</Text>
                            </View>
                            <View className="info-row">
                                <Text className="label">类别:</Text>
                                <Text className="value">{exercise.category}</Text>
                            </View>
                            {exercise.note && (
                                <View className="note">
                                    <Text className="note-text">{exercise.note}</Text>
                                </View>
                            )}
                            <View className="card-actions">
                                <View
                                    className="action-button edit"
                                    onClick={() => Taro.navigateTo({ url: `/pages/exercises/edit/index?id=${exercise.id}` })}
                                >
                                    <Text>编辑</Text>
                                </View>
                                <View
                                    className="action-button delete"
                                    onClick={() => handleDelete(exercise.id, exercise.name)}
                                >
                                    <Text>删除</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
