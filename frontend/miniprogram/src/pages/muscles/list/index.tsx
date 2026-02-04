import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { muscleApi } from '@mini/services/api';
import type { MuscleResponse } from '@/types';
import '../list.scss';

export default function MuscleList() {
    const [muscles, setMuscles] = useState<MuscleResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useLoad(() => {
        fetchMuscles();
    });

    const fetchMuscles = async () => {
        setLoading(true);
        try {
            const response = await muscleApi.getAll();
            const data = (response as any).data?.data || (response as any).data || [];
            setMuscles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch muscles:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const res = await Taro.showModal({
            title: '确认删除',
            content: `确定要删除肌肉群"${name}"吗？`,
            confirmText: '删除',
            cancelText: '取消'
        });

        if (res.confirm) {
            try {
                await muscleApi.delete(id);
                Taro.showToast({ title: '删除成功', icon: 'success' });
                fetchMuscles();
            } catch (error) {
                Taro.showToast({ title: '删除失败', icon: 'error' });
            }
        }
    };

    return (
        <View className="list-page">
            <View className="page-header">
                <Text className="page-title">肌肉群</Text>
                <View
                    className="add-button"
                    onClick={() => Taro.navigateTo({ url: '/pages/muscles/create/index' })}
                >
                    <Text>➕ 新建</Text>
                </View>
            </View>

            {loading ? (
                <View className="loading"><Text>加载中...</Text></View>
            ) : muscles.length === 0 ? (
                <View className="empty"><Text className="empty-text">暂无肌肉群</Text></View>
            ) : (
                <View className="list">
                    {muscles.map(muscle => (
                        <View key={muscle.id} className="item-card">
                            <View className="card-header">
                                <Text className="item-name">{muscle.name}</Text>
                                <Text className="item-id">#{muscle.id}</Text>
                            </View>
                            <View className="card-actions">
                                <View
                                    className="action-button edit"
                                    onClick={() => Taro.navigateTo({ url: `/pages/muscles/edit/index?id=${muscle.id}` })}
                                >
                                    <Text>编辑</Text>
                                </View>
                                <View
                                    className="action-button delete"
                                    onClick={() => handleDelete(muscle.id, muscle.name)}
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
