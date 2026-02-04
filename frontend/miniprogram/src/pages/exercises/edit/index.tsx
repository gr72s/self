import { View, Text, Input, Picker, Button } from '@tarojs/components';
import Taro, { useLoad, useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { exerciseApi } from '@mini/services/api';
import { EXERCISE_CATEGORIES } from '@/constants/categories';
import '../form.scss';

export default function ExerciseEdit() {
    const router = useRouter();
    const { id } = router.params;
    const [loading, setLoading] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [form, setForm] = useState({
        name: '',
        category: EXERCISE_CATEGORIES[0],
        note: ''
    });

    useLoad(() => {
        if (id) {
            fetchExercise(parseInt(id as string));
        }
    });

    const fetchExercise = async (exerciseId: number) => {
        try {
            const response = await exerciseApi.getById(exerciseId);
            const exercise = (response as any).data?.data || (response as any).data;
            const catIndex = EXERCISE_CATEGORIES.indexOf(exercise.category);
            setCategoryIndex(catIndex >= 0 ? catIndex : 0);
            setForm({
                name: exercise.name || '',
                category: exercise.category || EXERCISE_CATEGORIES[0],
                note: exercise.note || ''
            });
        } catch (error) {
            console.error('Failed to fetch exercise:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            Taro.showToast({ title: '请输入动作名称', icon: 'error' });
            return;
        }

        setLoading(true);
        try {
            await exerciseApi.update(parseInt(id as string), {
                name: form.name,
                category: form.category,
                note: form.note || undefined
            });

            Taro.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1500);
        } catch (error) {
            console.error('Failed to update exercise:', error);
            Taro.showToast({ title: '保存失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="form-page">
            <View className="form-card">
                <View className="form-item required">
                    <Text className="form-label">动作名称</Text>
                    <Input
                        className="form-input"
                        value={form.name}
                        onInput={(e) => setForm({ ...form, name: e.detail.value })}
                        placeholder="输入动作名称"
                        maxlength={100}
                    />
                </View>

                <View className="form-item required">
                    <Text className="form-label">类别</Text>
                    <Picker
                        mode="selector"
                        range={EXERCISE_CATEGORIES}
                        value={categoryIndex}
                        onChange={(e) => {
                            const index = e.detail.value as number;
                            setCategoryIndex(index);
                            setForm({ ...form, category: EXERCISE_CATEGORIES[index] });
                        }}
                    >
                        <View className="picker">
                            <Text>{form.category}</Text>
                        </View>
                    </Picker>
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
                        保存
                    </Button>
                </View>
            </View>
        </View>
    );
}
