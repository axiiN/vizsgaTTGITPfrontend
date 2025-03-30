import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Habit } from '../models/habit';
import { CoreApiService } from './core-api.service';

@Injectable({
  providedIn: 'root'
})
export class HabitsService {
  private endpoint = 'habits';

  constructor(private api: CoreApiService) { }

  /**
   * Get all habits for the current user
   * @param userId User ID for backward compatibility
   */
  getEntries(userId: string): Observable<Habit[]> {
    return this.api.get<Habit[]>(this.endpoint);
  }

  /**
   * Get a specific habit by ID
   */
  getHabitById(id: string): Observable<Habit> {
    return this.api.getById<Habit>(this.endpoint, id);
  }

  /**
   * Create a new habit
   */
  createHabit(habit: Habit): Observable<Habit> {
    // Add creation timestamp
    const newHabit = {
      ...habit,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      streak: 0
    };
    return this.api.post<Habit>(this.endpoint, newHabit);
  }

  /**
   * Update an existing habit
   * @param uid User ID for backward compatibility
   * @param habitId Habit ID to update
   * @param habit Updated habit data
   */
  updateEntry(uid: string, habitId: string, habit: Partial<Habit>): Observable<Habit> {
    // Add update timestamp
    const updatedHabit = {
      ...habit,
      updatedAt: Date.now()
    };
    return this.api.put<Habit>(this.endpoint, habitId, updatedHabit);
  }

  /**
   * Delete a habit
   * @param uid User ID for backward compatibility
   * @param habitId Habit ID to delete
   */
  deleteEntry(uid: string, habitId: string): Observable<any> {
    return this.api.delete(this.endpoint, habitId);
  }

  /**
   * Toggle habit completion status (DEPRECATED - use completeHabit instead)
   */
  toggleHabitCompletion(habitId: string, completed: boolean): Observable<Habit> {
    return this.api.patch<Habit>(this.endpoint, habitId, { completed });
  }

  /**
   * Complete a habit using the /habits/:id/complete endpoint
   * @param habitId The ID of the habit to complete
   */
  completeHabit(habitId: string): Observable<Habit> {
    const customPath = `${this.endpoint}/${habitId}/complete`;
    return this.api.patchCustomPath<Habit>(customPath, {});
  }
}
