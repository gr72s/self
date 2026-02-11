/**
 * 类型定义文件
 */

// 训练记录类型
export interface Workout {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  routineId?: string;
  routineName?: string;
  gymId?: string;
  gymName?: string;
  exercises: WorkoutExercise[];
  status: 'in_progress' | 'completed';
}

// 训练记录中的动作类型
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

// 训练记录中的组数类型
export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

// 训练计划类型
export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

// 训练计划中的动作类型
export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  order: number;
}

// 动作类型
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleId: string;
  muscleName: string;
  cues: string[];
  createdAt: string;
  updatedAt: string;
}

// 健身房类型
export interface Gym {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// 肌肉类型
export interface Muscle {
  id: string;
  name: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 表单错误类型
export interface FormErrors {
  [key: string]: string;
}

// 页面数据类型
export interface PageData<T> {
  loading: boolean;
  error: string;
  data: T;
}

// 微信小程序事件类型
export interface WxEvent {
  detail: {
    value: string;
  };
  currentTarget?: {
    dataset?: {
      [key: string]: any;
    };
  };
}

// 导航选项类型
export interface NavigateOptions {
  url: string;
  success?: () => void;
  fail?: (error: any) => void;
  complete?: () => void;
}
