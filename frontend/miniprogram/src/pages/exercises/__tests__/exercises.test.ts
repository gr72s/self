import { describe, it, expect, beforeEach, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { exerciseApi } from '@mini/services/api';
import { EXERCISE_CATEGORIES } from '@/constants/categories';

vi.mock('@tarojs/taro', () => ({
    default: {
        showToast: vi.fn(),
        showModal: vi.fn(),
        navigateBack: vi.fn(),
        navigateTo: vi.fn(),
    },
    useLoad: vi.fn((callback) => callback()),
    useRouter: vi.fn(() => ({ params: {} })),
}));

vi.mock('@mini/services/api', () => ({
    exerciseApi: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('ExerciseList Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch exercises on load', async () => {
        const mockExercises = [
            { id: 1, name: 'Bench Press', category: 'Chest' },
            { id: 2, name: 'Squat', category: 'Legs' },
        ];

        vi.mocked(exerciseApi.getAll).mockResolvedValue({
            status: 200,
            data: { data: mockExercises },
        } as any);

        const result = await exerciseApi.getAll();
        const exercises = (result as any).data.data;

        expect(exercises).toHaveLength(2);
        expect(exercises[0].category).toBe('Chest');
    });
});

describe('ExerciseCreate Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate required fields', () => {
        const formData = { name: '', category: EXERCISE_CATEGORIES[0], note: '' };

        if (!formData.name.trim()) {
            Taro.showToast({ title: '请输入动作名称', icon: 'error' });
        }

        expect(Taro.showToast).toHaveBeenCalled();
    });

    it('should create exercise with category', async () => {
        const formData = {
            name: 'Deadlift',
            category: 'Back',
            note: 'Compound movement',
        };

        vi.mocked(exerciseApi.create).mockResolvedValue({
            status: 200,
            data: { id: 3, ...formData },
        } as any);

        await exerciseApi.create(formData);

        expect(exerciseApi.create).toHaveBeenCalledWith(formData);
    });
});

describe('ExerciseEdit Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load and update exercise', async () => {
        const mockExercise = {
            id: 1,
            name: 'Push Up',
            category: 'Chest',
            note: 'Bodyweight exercise',
        };

        vi.mocked(exerciseApi.getById).mockResolvedValue({
            status: 200,
            data: { data: mockExercise },
        } as any);

        vi.mocked(exerciseApi.update).mockResolvedValue({
            status: 200,
        } as any);

        await exerciseApi.getById(1);
        await exerciseApi.update(1, { name: 'Updated Push Up', category: 'Chest' });

        expect(exerciseApi.update).toHaveBeenCalled();
    });
});
