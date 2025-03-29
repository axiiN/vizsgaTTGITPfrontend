export interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: number;
  updatedAt?: number;
  timestamp?: number; // Keep for backward compatibility
  isFavorite?: boolean;
}
