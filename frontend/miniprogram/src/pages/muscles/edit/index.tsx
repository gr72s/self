import { View, Text, Input, Button } from '@tarojs/components';
import Taro, { useLoad, useRouter } from '@tarojs/taro';
import { useState } from 'react';
import { muscleApi } from '@mini/services/api';
import '../form.scss';

export default function MuscleEdit() {
    const router = useRouter();
    const { id } = router.params;
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: ''
    });

    useLoad(() => {
        if (id) {
            fetchMuscle(parseInt(id as string));
        }
    });

    const fetchMuscle = async (muscleId: number) => {
        try {
            const response = await muscleApi.getById(muscleId);
            const muscle = (response as any).data?.data || (response as any).data;
            setForm({
                name: muscle.name || ''
            });
        } catch (error) {
            console.error('Failed to fetch muscle:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            Taro.showToast({ title: '请输入肌肉群名称', icon: 'error' });
            return;
        }

        setLoading(true);
        try {
            await muscleApi.update(parseInt(id as string), {
                name: form.name
            });

            Taro.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1500);
        } catch (error) {
            console.error('Failed to update muscle:', error);
            Taro.showToast({ title: '保存失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="form-page">
            <View className="form-card">
                <View className="form-item required">
                    <Text className="form-label">肌肉群名称</Text>
                    <Input
                        className="form-input"
                        value={form.name}
                        onInput={(e) => setForm({ ...form, name: e.detail.value })}
                        placeholder="输入肌肉群名称"
                        maxlength={100}
                    />
                </View>

                <View className="form-actions">
                    <Button className="cancel-button" onClick={() => Taro.navigateBack()}>
                        取消
                    </Button>
                    <Button className="submit-button" onClick={handleSubmit} loading={loading}>
                        保存
                    </Button>
                </View>
            </View>
        </View>
    );
}
