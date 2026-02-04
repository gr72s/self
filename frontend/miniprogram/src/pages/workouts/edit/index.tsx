import { View, Text, Input, Picker, Textarea, Button } from '@tarojs/components';
import Taro, { useLoad, useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { workoutApi, routineApi, gymApi } from '@mini/services/api';
import type { RoutineResponse, GymResponse } from '@/types';
import '../form.scss';

export default function WorkoutEdit() {
    const router = useRouter();
    const { id } = router.params;
    const [loading, setLoading] = useState(false);
    const [routines, setRoutines] = useState<RoutineResponse[]>([]);
    const [gyms, setGyms] = useState<GymResponse[]>([]);

    const [form, setForm] = useState({
        routineId: '',
        gymId: '',
        startTime: '',
        endTime: '',
        note: ''
    });

    const [selectedRoutineIndex, setSelectedRoutineIndex] = useState(0);
    const [selectedGymIndex, setSelectedGymIndex] = useState(0);

    useLoad(() => {
        if (id) {
            fetchWorkout(parseInt(id as string));
            fetchOptions();
        }
    });

    const fetchWorkout = async (workoutId: number) => {
        try {
            const response = await workoutApi.getById(workoutId);
            const workout = (response as any).data?.data || (response as any).data;
            setForm({
                routineId: String(workout.routine?.id || ''),
                gymId: String(workout.gym?.id || ''),
                startTime: workout.startTime || '',
                endTime: workout.endTime || '',
                note: workout.note || ''
            });
        } catch (error) {
            console.error('Failed to fetch workout:', error);
            Taro.showToast({ title: '加载失败', icon: 'error' });
        }
    };

    const fetchOptions = async () => {
        try {
            const [routineRes, gymRes] = await Promise.all([
                routineApi.getAll(),
                gymApi.getAll()
            ]);

            const routineData = (routineRes as any).data?.data || (routineRes as any).data || [];
            const gymData = (gymRes as any).data?.data || (gymRes as any).data || [];

            setRoutines(Array.isArray(routineData) ? routineData : []);
            setGyms(Array.isArray(gymData) ? gymData : []);

            // Set initial indices
            if (form.routineId && Array.isArray(routineData)) {
                const rIndex = routineData.findIndex((r: any) => r.id === parseInt(form.routineId));
                if (rIndex >= 0) setSelectedRoutineIndex(rIndex);
            }
            if (form.gymId && Array.isArray(gymData)) {
                const gIndex = gymData.findIndex((g: any) => g.id === parseInt(form.gymId));
                if (gIndex >= 0) setSelectedGymIndex(gIndex);
            }
        } catch (error) {
            console.error('Failed to fetch options:', error);
        }
    };

    const handleSubmit = async () => {
        if (!form.routineId || !form.gymId) {
            Taro.showToast({ title: '请填写必填项', icon: 'error' });
            return;
        }

        setLoading(true);
        try {
            await workoutApi.update(parseInt(id as string), {
                routineId: parseInt(form.routineId),
                gymId: parseInt(form.gymId),
                startTime: form.startTime || undefined,
                endTime: form.endTime || undefined,
                note: form.note || undefined
            });

            Taro.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1500);
        } catch (error) {
            console.error('Failed to update workout:', error);
            Taro.showToast({ title: '保存失败', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="form-page">
            <View className="form-card">
                <View className="form-item required">
                    <Text className="form-label">训练计划</Text>
                    <Picker
                        mode="selector"
                        range={routines.map(r => r.name)}
                        value={selectedRoutineIndex}
                        onChange={(e) => {
                            const index = e.detail.value as number;
                            setSelectedRoutineIndex(index);
                            setForm({ ...form, routineId: String(routines[index]?.id || '') });
                        }}
                    >
                        <View className="picker">
                            <Text>{routines[selectedRoutineIndex]?.name || '请选择计划'}</Text>
                        </View>
                    </Picker>
                </View>

                <View className="form-item required">
                    <Text className="form-label">健身房</Text>
                    <Picker
                        mode="selector"
                        range={gyms.map(g => g.name)}
                        value={selectedGymIndex}
                        onChange={(e) => {
                            const index = e.detail.value as number;
                            setSelectedGymIndex(index);
                            setForm({ ...form, gymId: String(gyms[index]?.id || '') });
                        }}
                    >
                        <View className="picker">
                            <Text>{gyms[selectedGymIndex]?.name || '请选择健身房'}</Text>
                        </View>
                    </Picker>
                </View>

                <View className="form-item">
                    <Text className="form-label">备注</Text>
                    <Textarea
                        className="form-textarea"
                        value={form.note}
                        onInput={(e) => setForm({ ...form, note: e.detail.value })}
                        placeholder="输入备注"
                        maxlength={500}
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
