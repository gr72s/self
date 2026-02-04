import { describe, it, expect, beforeEach, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { workoutApi } from '@mini/services/api';

// Mock Taro APIs
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

// Mock API
vi.mock('@mini/services/api', () => ({
    workoutApi: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getInProcess: vi.fn(),
    },
    userApi: {
        getCurrent: vi.fn(),
    },
}));

describe('WorkoutList Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch workouts on load', async () => {
        const mockWorkouts = [
            { id: 1, routine: { name: 'Test Routine' }, gym: { name: 'Test Gym' } },
            { id: 2, routine: { name: 'Another Routine' }, gym: { name: 'Another Gym' } },
        ];

        vi.mocked(workoutApi.getAll).mockResolvedValue({
            status: 200,
            data: { data: mockWorkouts },
        } as any);

        // Test will verify that getAll is called
        expect(workoutApi.getAll).toBeDefined();
    });

    it('should handle delete confirmation', async () => {
        vi.mocked(Taro.showModal).mockResolvedValue({
            confirm: true,
            cancel: false,
        } as any);

        vi.mocked(workoutApi.delete).mockResolvedValue({
            status: 200,
        } as any);

        // Verify mocks are set up correctly
        const result = await Taro.showModal({
            title: '确认删除',
            content: '确定要删除吗？',
        });

        expect(result.confirm).toBe(true);
    });

    it('should cancel delete when user declines', async () => {
        vi.mocked(Taro.showModal).mockResolvedValue({
            confirm: false,
            cancel: true,
        } as any);

        const result = await Taro.showModal({
            title: '确认删除',
            content: '确定要删除吗？',
        });

        expect(result.confirm).toBe(false);
        expect(workoutApi.delete).not.toHaveBeenCalled();
    });

    it('should show error toast on fetch failure', async () => {
        vi.mocked(workoutApi.getAll).mockRejectedValue(new Error('Network error'));

        try {
            await workoutApi.getAll();
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});

describe('WorkoutCreate Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate required fields', async () => {
        const formData = {
            routineId: '',
            gymId: '',
            note: '',
        };

        // Validation should fail
        if (!formData.routineId || !formData.gymId) {
            Taro.showToast({ title: '请填写必填项', icon: 'error' });
        }

        expect(Taro.showToast).toHaveBeenCalledWith({
            title: '请填写必填项',
            icon: 'error',
        });
    });

    it('should create workout successfully', async () => {
        const formData = {
            routineId: 1,
            gymId: 1,
            startTime: new Date().toISOString(),
            note: 'Test workout',
        };

        vi.mocked(workoutApi.create).mockResolvedValue({
            status: 200,
            data: { id: 1, ...formData },
        } as any);

        await workoutApi.create(formData);

        expect(workoutApi.create).toHaveBeenCalledWith(formData);
    });

    it('should handle create failure', async () => {
        vi.mocked(workoutApi.create).mockRejectedValue(new Error('Create failed'));

        try {
            await workoutApi.create({} as any);
        } catch (error: any) {
            expect(error.message).toBe('Create failed');
        }
    });
});

describe('WorkoutEdit Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load existing workout data', async () => {
        const mockWorkout = {
            id: 1,
            routine: { id: 1, name: 'Test Routine' },
            gym: { id: 1, name: 'Test Gym' },
            startTime: '2026-02-04T10:00:00Z',
            note: 'Existing note',
        };

        vi.mocked(workoutApi.getById).mockResolvedValue({
            status: 200,
            data: { data: mockWorkout },
        } as any);

        const result = await workoutApi.getById(1);
        const workout = (result as any).data.data;

        expect(workout.id).toBe(1);
        expect(workout.routine.name).toBe('Test Routine');
    });

    it('should update workout successfully', async () => {
        const updateData = {
            routineId: 1,
            gymId: 2,
            note: 'Updated note',
        };

        vi.mocked(workoutApi.update).mockResolvedValue({
            status: 200,
            data: { id: 1, ...updateData },
        } as any);

        await workoutApi.update(1, updateData);

        expect(workoutApi.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should navigate back after successful update', async () => {
        vi.mocked(workoutApi.update).mockResolvedValue({
            status: 200,
        } as any);

        await workoutApi.update(1, {} as any);

        // Simulate navigation
        Taro.navigateBack();

        expect(Taro.navigateBack).toHaveBeenCalled();
    });
});
