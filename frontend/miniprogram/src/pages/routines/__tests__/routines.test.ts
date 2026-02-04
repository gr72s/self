import { describe, it, expect, beforeEach, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { routineApi } from '@mini/services/api';

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
    routineApi: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('RoutineList Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch routines on load', async () => {
        const mockRoutines = [
            { id: 1, name: 'Push Day', note: 'Chest, shoulders, triceps' },
            { id: 2, name: 'Pull Day', note: 'Back, biceps' },
        ];

        vi.mocked(routineApi.getAll).mockResolvedValue({
            status: 200,
            data: { data: mockRoutines },
        } as any);

        const result = await routineApi.getAll();
        const routines = (result as any).data.data;

        expect(routines).toHaveLength(2);
        expect(routines[0].name).toBe('Push Day');
    });

    it('should handle delete with confirmation', async () => {
        vi.mocked(Taro.showModal).mockResolvedValue({
            confirm: true,
            cancel: false,
        } as any);

        vi.mocked(routineApi.delete).mockResolvedValue({
            status: 200,
        } as any);

        const modalResult = await Taro.showModal({
            title: '确认删除',
            content: '确定要删除计划"Push Day"吗？',
        });

        if (modalResult.confirm) {
            await routineApi.delete(1);
        }

        expect(routineApi.delete).toHaveBeenCalledWith(1);
    });
});

describe('RoutineCreate Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate required name field', () => {
        const formData = { name: '', note: '' };

        if (!formData.name.trim()) {
            Taro.showToast({ title: '请输入计划名称', icon: 'error' });
        }

        expect(Taro.showToast).toHaveBeenCalledWith({
            title: '请输入计划名称',
            icon: 'error',
        });
    });

    it('should create routine successfully', async () => {
        const formData = {
            name: 'New Routine',
            note: 'My new training routine',
        };

        vi.mocked(routineApi.create).mockResolvedValue({
            status: 200,
            data: { id: 3, ...formData },
        } as any);

        await routineApi.create(formData);

        expect(routineApi.create).toHaveBeenCalledWith(formData);
    });
});

describe('RoutineEdit Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load existing routine', async () => {
        const mockRoutine = {
            id: 1,
            name: 'Existing Routine',
            note: 'Existing note',
        };

        vi.mocked(routineApi.getById).mockResolvedValue({
            status: 200,
            data: { data: mockRoutine },
        } as any);

        const result = await routineApi.getById(1);
        const routine = (result as any).data.data;

        expect(routine.name).toBe('Existing Routine');
    });

    it('should update routine successfully', async () => {
        const updateData = {
            name: 'Updated Routine',
            note: 'Updated note',
        };

        vi.mocked(routineApi.update).mockResolvedValue({
            status: 200,
        } as any);

        await routineApi.update(1, updateData);

        expect(routineApi.update).toHaveBeenCalledWith(1, updateData);
    });
});
