import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { gymApi } from '@mini/services/api';
import type { GymResponse } from '@/types';
import '../list.scss';

export default function GymList() {
    const [gyms, setGyms] = useState<GymResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useLoad(() => {
        fetchGyms();
    });

    const fetchGyms = async () => {
        setLoading(true);
        try {
            const response = await gymApi.getAll();
            const data = (response as any).data?.data || (response as any).data || [];
            setGyms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch gyms:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const res = await Taro.showModal({
            title: '确认删除',
            content: `确定要删除健身房"${name}"吗？`,
            confirmText: '删除',
            cancelText: '取消'
        });

        if (res.confirm) {
            try {
                await gymApi.delete(id);
                Taro.showToast({ title: '删除成功', icon: 'success' });
                fetchGyms();
            } catch (error) {
                Taro.showToast({ title: '删除失败', icon: 'error' });
            }
        }
    };

    return (
        <View className="list-page">
            <View className="page-header">
                <Text className="page-title">健身房</Text>
                <View
                    className="add-button"
                    onClick={() => Taro.navigateTo({ url: '/pages/gyms/create/index' })}
                >
                    <Text>➕ 新建</Text>
                </View>
            </View>

            {loading ? (
                <View className="loading"><Text>加载中...</Text></View>
            ) : gyms.length === 0 ? (
                <View className="empty"><Text className="empty-text">暂无健身房</Text></View>
            ) : (
                <View className="list">
                    {gyms.map(gym => (
                        <View key={gym.id} className="item-card">
                            <View className="card-header">
                                <Text className="item-name">{gym.name}</Text>
                                <Text className="item-id">#{gym.id}</Text>
                            </View>
                            {gym.note && (
                                <View className="note">
                                    <Text className="note-text">{gym.note}</Text>
                                </View>
                            )}
                            <View className="card-actions">
                                <View
                                    className="action-button edit"
                                    onClick={() => Taro.navigateTo({ url: `/pages/gyms/edit/index?id=${gym.id}` })}
                                >
                                    <Text>编辑</Text>
                                </View>
                                <View
                                    className="action-button delete"
                                    onClick={() => handleDelete(gym.id, gym.name)}
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
