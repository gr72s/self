import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { MuscleResponse, ExerciseResponse, GymResponse } from '@/types';

// 定义通用的表格状态
interface TableState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  page: number;
  rowsPerPage: number;
  sortConfig: { key: keyof T; direction: 'asc' | 'desc' };
  editingId: number | null;
  deleteDialogOpen: boolean;
  itemToDelete: number | null;
}

// 定义完整的应用状态
interface AppState {
  muscles: TableState<MuscleResponse & { isNew?: boolean }>;
  exercises: TableState<ExerciseResponse & { isNew?: boolean }>;
  gyms: TableState<GymResponse & { isNew?: boolean }>;
}

// 定义Action类型
type ActionType =
  // 通用数据操作
  | { type: 'SET_DATA'; module: keyof AppState; payload: any[] }
  | { type: 'SET_LOADING'; module: keyof AppState; payload: boolean }
  | { type: 'SET_ERROR'; module: keyof AppState; payload: string | null }
  | { type: 'ADD_ITEM'; module: keyof AppState; payload: any }
  | { type: 'UPDATE_ITEM'; module: keyof AppState; payload: { id: number; data: any } }
  | { type: 'DELETE_ITEM'; module: keyof AppState; payload: number }
  | { type: 'SET_SEARCH_TERM'; module: keyof AppState; payload: string }
  | { type: 'SET_PAGE'; module: keyof AppState; payload: number }
  | { type: 'SET_ROWS_PER_PAGE'; module: keyof AppState; payload: number }
  | { type: 'SET_SORT_CONFIG'; module: keyof AppState; payload: { key: string; direction: 'asc' | 'desc' } }
  | { type: 'SET_EDITING_ID'; module: keyof AppState; payload: number | null }
  | { type: 'SET_DELETE_DIALOG_OPEN'; module: keyof AppState; payload: boolean }
  | { type: 'SET_ITEM_TO_DELETE'; module: keyof AppState; payload: number | null }
  | { type: 'RESET_STATE'; module: keyof AppState };

// 初始状态
const initialState: AppState = {
  muscles: {
    data: [],
    loading: false,
    error: null,
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    sortConfig: { key: 'name', direction: 'asc' },
    editingId: null,
    deleteDialogOpen: false,
    itemToDelete: null
  },
  exercises: {
    data: [],
    loading: false,
    error: null,
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    sortConfig: { key: 'name', direction: 'asc' },
    editingId: null,
    deleteDialogOpen: false,
    itemToDelete: null
  },
  gyms: {
    data: [],
    loading: false,
    error: null,
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    sortConfig: { key: 'name', direction: 'asc' },
    editingId: null,
    deleteDialogOpen: false,
    itemToDelete: null
  }
};

// Reducer函数
const adminReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          data: action.payload
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          loading: action.payload
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          error: action.payload
        }
      };
    
    case 'ADD_ITEM':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          data: [action.payload, ...state[action.module].data]
        }
      };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          data: state[action.module].data.map(item => 
            item.id === action.payload.id ? { ...item, ...action.payload.data } : item
          )
        }
      };
    
    case 'DELETE_ITEM':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          data: state[action.module].data.filter(item => item.id !== action.payload)
        }
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          searchTerm: action.payload,
          page: 0 // 搜索时重置页码
        }
      };
    
    case 'SET_PAGE':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          page: action.payload
        }
      };
    
    case 'SET_ROWS_PER_PAGE':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          rowsPerPage: action.payload,
          page: 0 // 改变每页行数时重置页码
        }
      };
    
    case 'SET_SORT_CONFIG':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          sortConfig: action.payload as any
        }
      };
    
    case 'SET_EDITING_ID':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          editingId: action.payload
        }
      };
    
    case 'SET_DELETE_DIALOG_OPEN':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          deleteDialogOpen: action.payload
        }
      };
    
    case 'SET_ITEM_TO_DELETE':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          itemToDelete: action.payload
        }
      };
    
    case 'RESET_STATE':
      return {
        ...state,
        [action.module]: initialState[action.module]
      };
    
    default:
      return state;
  }
};

// 创建Context
interface AdminStateContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

// Provider组件
interface AdminStateProviderProps {
  children: ReactNode;
}

export const AdminStateProvider: React.FC<AdminStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  return (
    <AdminStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminStateContext.Provider>
  );
};

// 自定义Hook
export const useAdminState = () => {
  const context = useContext(AdminStateContext);
  if (context === undefined) {
    throw new Error('useAdminState must be used within an AdminStateProvider');
  }
  return context;
};

// 自定义Hook，用于特定模块
export const useModuleState = <T extends keyof AppState>(module: T) => {
  const { state, dispatch: rootDispatch } = useAdminState();
  
  return {
    state: state[module],
    dispatch: (action: any) => {
      rootDispatch({ ...action, module } as ActionType);
    }
  };
};
