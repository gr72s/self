/**
 * 类型定义文件
 * 虽然微信小程序原生使用 JavaScript，但保留类型定义结构便于参考
 */

/**
 * 训练记录类型
 */
export const Workout = {
  id: String,
  name: String,
  startTime: String,
  endTime: String,
  duration: Number,
  routineId: String,
  routineName: String,
  gymId: String,
  gymName: String,
  exercises: Array,
  status: String
};

/**
 * 训练记录中的动作类型
 */
export const WorkoutExercise = {
  id: String,
  exerciseId: String,
  exerciseName: String,
  sets: Array
};

/**
 * 训练记录中的组数类型
 */
export const WorkoutSet = {
  id: String,
  setNumber: Number,
  weight: Number,
  reps: Number,
  completed: Boolean
};

/**
 * 训练计划类型
 */
export const Routine = {
  id: String,
  name: String,
  description: String,
  exercises: Array,
  createdAt: String,
  updatedAt: String
};

/**
 * 训练计划中的动作类型
 */
export const RoutineExercise = {
  id: String,
  exerciseId: String,
  exerciseName: String,
  sets: Number,
  reps: Number,
  weight: Number,
  order: Number
};

/**
 * 动作类型
 */
export const Exercise = {
  id: String,
  name: String,
  description: String,
  muscleId: String,
  muscleName: String,
  cues: Array,
  createdAt: String,
  updatedAt: String
};

/**
 * 健身房类型
 */
export const Gym = {
  id: String,
  name: String,
  address: String,
  createdAt: String,
  updatedAt: String
};

/**
 * 肌肉类型
 */
export const Muscle = {
  id: String,
  name: String,
  group: String,
  createdAt: String,
  updatedAt: String
};

/**
 * API响应类型
 */
export const ApiResponse = {
  success: Boolean,
  data: Object,
  message: String
};

/**
 * 表单错误类型
 */
export const FormErrors = {};

/**
 * 页面数据类型
 */
export const PageData = {
  loading: Boolean,
  error: String,
  data: Object
};

/**
 * 微信小程序事件类型
 */
export const WxEvent = {
  detail: {
    value: String
  },
  currentTarget: {
    dataset: {}
  }
};

/**
 * 导航选项类型
 */
export const NavigateOptions = {
  url: String,
  success: Function,
  fail: Function,
  complete: Function
};

/**
 * 动作分类
 */
export const Category = {
  Mobility: 'Mobility',
  WarmUp: 'WarmUp',
  Activation: 'Activation',
  WorkingSets: 'WorkingSets',
  Corrective: 'Corrective',
  Aerobic: 'Aerobic',
  CoolDown: 'CoolDown'
};