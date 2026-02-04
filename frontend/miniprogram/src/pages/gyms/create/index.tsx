import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { gymApi } from '@mini/services/api';
import '../form.scss';

export default function GymCreate() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        note: ''
    });

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            Taro.showToast({ title: '请输入健身房名称', icon: 'error' });
            return;
        }

        setLoading(true);
        try {
            await gymApi.create({
                name: form.name,
                note: form.note || undefined
            });

            Taro.showToast({ title: '创建成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1500);
        } catch (error) {
            console.error('Failed to create gym:', error);
            Taro.showToast({ title: '创建失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="form-page">
            <View className="form-card">
                <View className="form-item required">
                    <Text className="form-label">健身房名称</Text>
                    <Input
                        className="form-input"
                        value={form.name}
                        onInput={(e) => setForm({ ...form, name: e.detail.value })}
                        placeholder="输入健身房名称"
                        maxlength={100}
                    />
                </View>

                <View className="form-item">
                    <Text className="form-label">备注</Text>
                    <Input
                        className="form-input"
                        value={form.note}
                        onInput={(e) => setForm({ ...form, note: e.detail.value })}
                        placeholder="输入备注"
                        maxlength={200}
                    />
                </View>

                <View className="form-actions">
                    <Button className="cancel-button" onClick={() => Taro.navigateBack()}>
                        取消
                    </Button>
                    <Button className="submit-button" onClick={handleSubmit} loading={loading}>
                        创建
                    </Button>
                </View>
            </View>
        </View>
    );
}
