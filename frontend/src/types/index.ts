// 肌肉类型
export interface MuscleResponse {
  id: number;
  name: string;
  description?: string;
}

// 动作类型
export interface ExerciseResponse {
  id: number;
  name: string;
  originName: string;
  description?: string;
  mainMuscles: Set<MuscleResponse>;
  supportMuscles: Set<MuscleResponse>;
  cues: string[];
}

// 训练计划目标
export interface TargetResponse {
  id: number;
  name: string;
  description?: string;
}

// 健身场所
export interface GymResponse {
  id: number;
  name: string;
  description?: string;
}

// 动作分类
export enum Category {
  Mobility = 'Mobility',
  WarmUp = 'WarmUp',
  Activation = 'Activation',
  WorkingSets = 'WorkingSets',
  Corrective = 'Corrective',
  Aerobic = 'Aerobic',
  CoolDown = 'CoolDown'
}

// 检查项
export interface ChecklistItem {
  name: string;
  isOptional: boolean;
}

// 训练计划
export interface RoutineResponse {
  id: number;
  name: string;
  description?: string;
  workout?: WorkoutResponse;
  targets: Set<TargetResponse>;
  slots: Set<SlotResponse>;
  checklist: ChecklistItem[];
  note?: string;
}

// 训练记录
export interface WorkoutResponse {
  id: number;
  startTime?: string;
  endTime?: string;
  gym: GymResponse;
  routine?: RoutineResponse;
  target: Set<TargetResponse>;
  note?: string;
}

// 动作具体信息
export interface SlotResponse {
  id: number;
  routine: RoutineResponse;
  exercise: ExerciseResponse;
  stars: number;
  category: Category;
  setNumber?: number;
  weight?: number;
  reps?: number;
  duration?: number;
  sequence: number;
}

// 通用响应类型
export interface Response<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
