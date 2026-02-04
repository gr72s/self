import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { routineApi } from '@mini/services/api';
import type { RoutineResponse } from '@/types';
import '../list.scss';

export default function RoutineList() {
    const [routines, setRoutines] = useState<RoutineResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useLoad(() => {
        fetchRoutines();
    });

    const fetchRoutines = async () => {
        setLoading(true);
        try {
            const response = await routineApi.getAll();
            const data = (response as any).data?.data || (response as any).data || [];
            setRoutines(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch routines:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const res = await Taro.showModal({
            title: '确认删除',
            content: `确定要删除计划"${name}"吗？`,
            confirmText: '删除',
            cancelText: '取消'
        });

        if (res.confirm) {
            try {
                await routineApi.delete(id);
                Taro.showToast({ title: '删除成功', icon: 'success' });
                fetchRoutines();
            } catch (error) {
                Taro.showToast({ title: '删除失败', icon: 'error' });
            }
        }
    };

    return (
        <View className="list-page">
            <View className="page-header">
                <Text className="page-title">训练计划</Text>
                <View
                    className="add-button"
                    onClick={() => Taro.navigateTo({ url: '/pages/routines/create/index' })}
                >
                    <Text>➕ 新建</Text>
                </View>
            </View>

            {loading ? (
                <View className="loading"><Text>加载中...</Text></View>
            ) : routines.length === 0 ? (
                <View className="empty"><Text className="empty-text">暂无训练计划</Text></View>
            ) : (
                <View className="list">
                    {routines.map(routine => (
                        <View key={routine.id} className="item-card">
                            <View className="card-header">
                                <Text className="item-name">{routine.name}</Text>
                                <Text className="item-id">#{routine.id}</Text>
                            </View>
                            {routine.note && (
                                <View className="note">
                                    <Text className="note-text">{routine.note}</Text>
                                </View>
                            )}
                            <View className="card-actions">
                                <View
                                    className="action-button edit"
                                    onClick={() => Taro.navigateTo({ url: `/pages/routines/edit/index?id=${routine.id}` })}
                                >
                                    <Text>编辑</Text>
                                </View>
                                <View
                                    className="action-button delete"
                                    onClick={() => handleDelete(routine.id, routine.name)}
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
