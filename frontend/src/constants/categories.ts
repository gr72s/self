// Exercise categories - shared constants
// Used by both Web and Miniprogram for workout classification

export const CATEGORIES = {
    Mobility: 'Mobility',
    WarmUp: 'WarmUp',
    Activation: 'Activation',
    WorkingSets: 'WorkingSets',
    Corrective: 'Corrective',
    Aerobic: 'Aerobic',
    CoolDown: 'CoolDown',
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
    Mobility: '灵活性',
    WarmUp: '热身',
    Activation: '激活',
    WorkingSets: '正式组',
    Corrective: '矫正',
    Aerobic: '有氧',
    CoolDown: '放松',
};

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];
