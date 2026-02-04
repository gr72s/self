// Shared generic list page component - can be used for any entity
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './list.scss';

interface ListPageProps<T> {
    title: string;
    api: {
        getAll: () => Promise<any>;
        delete: (id: number) => Promise<any>;
    };
    createPath: string;
    editPath: string;
    renderItem: (item: T) => JSX.Element;
    getItemName: (item: T) => string;
}

export function createListPage<T extends { id: number }>(props: ListPageProps<T>) {
    return function ListPage() {
        const [items, setItems] = useState<T[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchItems();
        }, []);

        const fetchItems = async () => {
            setLoading(true);
            try {
                const response = await props.api.getAll();
                const data = (response as any).data?.data || (response as any).data || [];
                setItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch items:', error);
                Taro.showToast({ title: '加载失败', icon: 'error' });
            } finally {
                setLoading(false);
            }
        };

        const handleDelete = async (item: T) => {
            const res = await Taro.showModal({
                title: '确认删除',
                content: `确定要删除"${props.getItemName(item)}"吗？`,
                confirmText: '删除',
                cancelText: '取消'
            });

            if (res.confirm) {
                try {
                    await props.api.delete(item.id);
                    Taro.showToast({ title: '删除成功', icon: 'success' });
                    fetchItems();
                } catch (error) {
                    console.error('Failed to delete:', error);
                    Taro.showToast({ title: '删除失败', icon: 'error' });
                }
            }
        };

        return (
            <View className="list-page">
                <View className="page-header">
                    <Text className="page-title">{props.title}</Text>
                    <Button
                        className="add-button"
                        onClick={() => Taro.navigateTo({ url: props.createPath })}
                    >
                        ➕ 新建
                    </Button>
                </View>

                {loading ? (
                    <View className="loading">
                        <Text>加载中...</Text>
                    </View>
                ) : items.length === 0 ? (
                    <View className="empty">
                        <Text className="empty-text">暂无数据</Text>
                    </View>
                ) : (
                    <View className="list">
                        {items.map(item => (
                            <View key={item.id} className="item-card">
                                {props.renderItem(item)}
                                <View className="card-actions">
                                    <Button
                                        className="action-button edit"
                                        onClick={() => Taro.navigateTo({ url: `${props.editPath}?id=${item.id}` })}
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        className="action-button delete"
                                        onClick={() => handleDelete(item)}
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
    };
}
