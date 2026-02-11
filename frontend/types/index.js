// 类型定义文件
// 虽然微信小程序原生使用 JavaScript，但保留类型定义结构便于参考

// 肌肉类型
export const MuscleResponse = {
  id: Number,
  name: String,
  description: String
};

// 动作类型
export const ExerciseResponse = {
  id: Number,
  name: String,
  originName: String,
  description: String,
  mainMuscles: Set,
  supportMuscles: Set,
  cues: Array
};

// 训练计划目标
export const TargetResponse = {
  id: Number,
  name: String,
  description: String
};

// 健身场所
export const GymResponse = {
  id: Number,
  name: String,
  description: String,
  location: String
};

// 动作分类
export const Category = {
  Mobility: 'Mobility',
  WarmUp: 'WarmUp',
  Activation: 'Activation',
  WorkingSets: 'WorkingSets',
  Corrective: 'Corrective',
  Aerobic: 'Aerobic',
  CoolDown: 'CoolDown'
};

// 检查项
export const ChecklistItem = {
  name: String,
  isOptional: Boolean
};

// 训练计划
export const RoutineResponse = {
  id: Number,
  name: String,
  description: String,
  workout: Object,
  targets: Set,
  slots: Set,
  checklist: Array,
  note: String
};

// 训练记录
export const WorkoutResponse = {
  id: Number,
  startTime: String,
  endTime: String,
  gym: Object,
  routine: Object,
  target: Set,
  note: String
};

// 动作具体信息
export const SlotResponse = {
  id: Number,
  routine: Object,
  exercise: Object,
  stars: Number,
  category: String,
  setNumber: Number,
  weight: Number,
  reps: Number,
  duration: Number,
  sequence: Number
};

// 通用响应类型
export const Response = {
  success: Boolean,
  data: Object,
  message: String
};