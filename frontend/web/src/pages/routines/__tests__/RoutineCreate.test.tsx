import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutineCreate from '../RoutineCreate';
import { routineApi } from '@web/services/api';
import { BrowserRouter } from 'react-router-dom';

// Mock API modules
jest.mock('@/services/api', () => ({
    routineApi: {
        create: jest.fn(),
    },
}));

// Mock useNotifications and useNavigate
const mockShow = jest.fn();
jest.mock('@/providers/useNotifications', () => () => ({
    show: mockShow,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('RoutineCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form elements correctly', async () => {
        render(
            <BrowserRouter>
                <RoutineCreate />
            </BrowserRouter>
        );

        expect(screen.getByText('Create New Routine')).toBeInTheDocument();
        expect(screen.getByLabelText(/Routine Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Note/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Routine/i })).toBeInTheDocument();
    });

    test('submits form with valid data', async () => {
        (routineApi.create as jest.Mock).mockResolvedValue({
            status: 200,
            data: { success: true }
        });

        render(
            <BrowserRouter>
                <RoutineCreate />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Routine Name/i), { target: { value: 'My Routine' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Desc' } });
        fireEvent.change(screen.getByLabelText(/Note/i), { target: { value: 'Notes' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Routine/i }));

        await waitFor(() => {
            expect(routineApi.create).toHaveBeenCalledWith({
                name: 'My Routine',
                description: 'Desc',
                note: 'Notes'
            });
            expect(mockShow).toHaveBeenCalledWith('Routine created successfully', expect.any(Object));
            expect(mockNavigate).toHaveBeenCalledWith('/routines');
        });
    });
});
