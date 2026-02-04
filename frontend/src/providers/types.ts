// Shared provider interface definitions
// Platform-specific implementations will differ, but interface stays the same

export interface NotificationOptions {
    severity?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export interface DialogOptions {
    title?: string;
    okText?: string;
    cancelText?: string;
    severity?: 'info' | 'warning' | 'error';
}

export interface NotificationsContextValue {
    show: (message: string, options?: NotificationOptions) => void;
}

export interface DialogsContextValue {
    confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
    alert: (message: string, options?: Omit<DialogOptions, 'cancelText'>) => Promise<void>;
}
