import { renderHook, act } from '@testing-library/react';
import { AdminStateProvider, useAdminState } from './AdminStateContext';

describe('AdminStateContext Sidebar Logic', () => {
    it('should provide initial state', () => {
        const { result } = renderHook(() => useAdminState(), {
            wrapper: AdminStateProvider,
        });
        expect(result.current.state.sidebar.isDesktopNavigationExpanded).toBe(true);
        expect(result.current.state.sidebar.expandedItemIds).toEqual([]);
        expect(result.current.state.sidebar.isFullyExpanded).toBe(true);
    });

    it('should toggle desktop navigation', () => {
        const { result } = renderHook(() => useAdminState(), {
            wrapper: AdminStateProvider,
        });
        act(() => {
            result.current.dispatch({ type: 'SIDEBAR_SET_DESKTOP_EXPANDED', payload: false });
        });
        expect(result.current.state.sidebar.isDesktopNavigationExpanded).toBe(false);
    });

    it('should toggle sidebar items', () => {
        const { result } = renderHook(() => useAdminState(), {
            wrapper: AdminStateProvider,
        });
        act(() => {
            result.current.dispatch({ type: 'SIDEBAR_TOGGLE_ITEM', payload: 'reports' });
        });
        expect(result.current.state.sidebar.expandedItemIds).toContain('reports');

        act(() => {
            result.current.dispatch({ type: 'SIDEBAR_TOGGLE_ITEM', payload: 'reports' });
        });
        expect(result.current.state.sidebar.expandedItemIds).not.toContain('reports');
    });

    it('should set fully expanded/collapsed state', () => {
        const { result } = renderHook(() => useAdminState(), {
            wrapper: AdminStateProvider,
        });
        act(() => {
            result.current.dispatch({ type: 'SIDEBAR_SET_FULLY_EXPANDED', payload: false });
        });
        expect(result.current.state.sidebar.isFullyExpanded).toBe(false);

        act(() => {
            result.current.dispatch({ type: 'SIDEBAR_SET_FULLY_COLLAPSED', payload: true });
        });
        expect(result.current.state.sidebar.isFullyCollapsed).toBe(true);
    });
});
