import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Task } from '../models/task';
import { CoreApiService } from './core-api.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private endpoint = 'tasks';

  constructor(private api: CoreApiService) { }

  /**
   * Get all tasks for the current user
   */
  getTasks(): Observable<Task[]> {
    console.log('Fetching all tasks from endpoint:', `${this.endpoint} (full URL: ${this.api['apiUrl']}/${this.endpoint})`);
    return this.api.get<Task[]>(this.endpoint).pipe(
      tap(tasks => {
        console.log('Tasks received:', tasks);
        if (Array.isArray(tasks)) {
          console.log(`Received ${tasks.length} tasks`);
        } else {
          console.warn('Response is not an array:', tasks);
        }
      }),
      catchError(error => {
        console.error('Error in getTasks service method:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific task by ID
   */
  getTaskById(id: string): Observable<Task> {
    console.log(`Fetching task with id: ${id}`);
    return this.api.getById<Task>(this.endpoint, id).pipe(
      tap(task => console.log('Task received:', task))
    );
  }

  /**
   * Create a new task
   */
  createTask(task: Task): Observable<Task> {
    // Add creation timestamp
    const newTask = {
      ...task,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    console.log('Creating task with data:', newTask);
    return this.api.post<Task>(this.endpoint, newTask).pipe(
      tap(createdTask => console.log('Created task:', createdTask))
    );
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    // Add update timestamp
    const updatedTask = {
      ...task,
      updatedAt: Date.now()
    };
    console.log(`Updating task ${id} with data:`, updatedTask);
    return this.api.put<Task>(this.endpoint, id, updatedTask).pipe(
      tap(result => console.log('Update result:', result))
    );
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<any> {
    console.log(`Deleting task with id: ${id}`);
    return this.api.delete(this.endpoint, id).pipe(
      tap(result => console.log('Delete result:', result))
    );
  }

  /**
   * Toggle task completion status using the dedicated toggle endpoint
   */
  toggleTaskCompletion(id: string, completed: boolean): Observable<Task> {
    console.log(`Using toggle endpoint for task ${id}, setting completed to ${completed}`);
    // Using the dedicated /tasks/:id/toggle endpoint
    const togglePath = `${this.endpoint}/${id}/toggle`;
    return this.api.patchCustomPath<Task>(togglePath, {}).pipe(
      tap(result => console.log('Toggle result from dedicated endpoint:', result))
    );
  }
} 