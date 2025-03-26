export interface Habit {
    id?: string;
    name: string;
    icon?: string;
    category?: 'health' | 'productivity' | 'personal' | 'learning' | string;
    frequency?: 'daily' | 'weekly' | 'monthly' | string;
    reminderTime?: string;
    description?: string;
    streak?: number;
    completed?: boolean;
    userId?: string;
    createdAt?: number;
    updatedAt?: number;
}