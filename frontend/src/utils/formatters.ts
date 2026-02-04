// Shared utility functions for formatting data
// Can be used by both Web and Miniprogram

/**
 * Format date/time string to localized format
 */
export const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
};

/**
 * Format date only
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
};

/**
 * Format time only
 */
export const formatTime = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString();
};

/**
 * Format weight with unit
 */
export const formatWeight = (weight?: number): string => {
    if (!weight) return '-';
    return `${weight} kg`;
};

/**
 * Format reps count
 */
export const formatReps = (reps?: number): string => {
    if (!reps) return '-';
    return `${reps} reps`;
};

/**
 * Calculate duration between two timestamps  
 * @returns formatted string like "1h 30m" or "45m"
 */
export const calculateDuration = (start?: string, end?: string): string => {
    if (!start) return '-';
    if (!end) return 'In Progress';

    const duration = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};
