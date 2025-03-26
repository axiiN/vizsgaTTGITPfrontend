import { Component, OnInit } from '@angular/core';
import { Task } from '../models/task';
import { AuthService } from '../services/auth.service';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasksList: Task[] = [];
  activeFilter: 'all' | 'today' | 'week' = 'all';
  isLoading: boolean = false;

  // Quick task form
  quickTaskName: string = '';
  quickTaskPriority: 'high' | 'medium' | 'low' | '' = '';
  quickTaskDueDate: string = '';

  // Modal form
  modalTaskName: string = '';
  modalTaskPriority: 'high' | 'medium' | 'low' | '' = '';
  modalTaskDueDate: string = '';
  modalTaskDescription: string = '';

  // Edit task
  editingTask: Task | null = null;

  constructor(
    private tasksService: TasksService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
    // Set default due date to today
    const today = new Date().toISOString().split('T')[0];
    this.quickTaskDueDate = today;
    this.modalTaskDueDate = today;
  }
  
  loadTasks(): void {
    this.isLoading = true;
    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasksList = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      },
      complete: () => {
        // Task loading completed
      }
    });
  }
  
  createTask(task: Task): void {
    this.isLoading = true;
    this.tasksService.createTask(task).subscribe({
      next: (newTask) => {
        this.tasksList.push(newTask);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.isLoading = false;
      }
    });
  }

  getCompletedTasksCount(): number {
    return this.tasksList.filter(task => task.completed).length;
  }

  getDueTasksCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.tasksList.filter(task => 
      task.dueDate && // Add null check
      task.dueDate === today && 
      !task.completed
    ).length;
  }

  getOverdueTasksCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.tasksList.filter(task => 
      task.dueDate && // Add null check
      task.dueDate < today && 
      !task.completed
    ).length;
  }

  getUpcomingTasks(): Task[] {
    // Sort tasks by due date and return the next 3 non-completed tasks
    return this.tasksList
      .filter(task => !task.completed && task.dueDate) // Filter out tasks with no due date
      .sort((a, b) => {
        // Safe comparison with null/undefined checks
        if (!a.dueDate) return 1;  // Push undefined dates to the end
        if (!b.dueDate) return -1; // Push undefined dates to the end
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 3);
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bi-exclamation-circle-fill';
      case 'medium':
        return 'bi-dash-circle-fill';
      case 'low':
        return 'bi-arrow-down-circle-fill';
      default:
        return 'bi-check-circle';
    }
  }

  getPriorityIconClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-opacity-10 rounded-circle';
      case 'medium':
        return 'bg-opacity-10 rounded-circle';
      case 'low':
        return 'bg-opacity-10 rounded-circle';
      default:
        return 'bg-opacity-10 rounded-circle';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-info';
      default:
        return 'bg-primary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getRelativeDueDate(dateString: string): string {
    if (!dateString) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  }

  openEditModal(task: Task): void {
    // Create a copy of the task to avoid direct modification
    this.editingTask = { ...task };
    
    // Open the modal
    const modal = document.getElementById('editTaskModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  saveEditTask(): void {
    if (!this.editingTask || !this.editingTask.id) return;
    
    const taskId = this.editingTask.id;
    const updatedTask = { ...this.editingTask };
    
    // Remove id to avoid sending it in the update call
    delete updatedTask.id;
    
    this.updateTask(taskId, updatedTask);
    this.editingTask = null;
  }

  addQuickTask(): void {
    if (!this.quickTaskName || !this.quickTaskPriority || !this.quickTaskDueDate) {
      console.error('Please fill all required fields');
      return;
    }

    const newTask: Task = {
      name: this.quickTaskName,
      completed: false,
      priority: this.quickTaskPriority as 'high' | 'medium' | 'low',
      dueDate: this.quickTaskDueDate
    };

    this.createTask(newTask);
    
    // Reset form
    this.quickTaskName = '';
    this.quickTaskPriority = '';
    const today = new Date().toISOString().split('T')[0];
    this.quickTaskDueDate = today;
  }

  addModalTask(): void {
    if (!this.modalTaskName || !this.modalTaskPriority || !this.modalTaskDueDate) {
      console.error('Please fill all required fields');
      return;
    }

    const newTask: Task = {
      name: this.modalTaskName,
      completed: false,
      priority: this.modalTaskPriority as 'high' | 'medium' | 'low',
      dueDate: this.modalTaskDueDate,
      description: this.modalTaskDescription
    };

    this.createTask(newTask);
    
    // Reset form
    this.modalTaskName = '';
    this.modalTaskPriority = '';
    this.modalTaskDescription = '';
    const today = new Date().toISOString().split('T')[0];
    this.modalTaskDueDate = today;
  }
  
  updateTask(id: string, updatedTask: Partial<Task>): void {
    this.isLoading = true;
    this.tasksService.updateTask(id, updatedTask).subscribe({
      next: (task) => {
        const index = this.tasksList.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tasksList[index] = {...this.tasksList[index], ...task};
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.isLoading = false;
      }
    });
  }
  
  deleteTask(id: string): void {
    this.isLoading = true;
    this.tasksService.deleteTask(id).subscribe({
      next: () => {
        this.tasksList = this.tasksList.filter(task => task.id !== id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.isLoading = false;
      }
    });
  }
  
  toggleTaskCompletion(task: Task): void {
    if (!task.id) return;
    
    const completed = !task.completed;
    this.tasksService.toggleTaskCompletion(task.id, completed).subscribe({
      next: (updatedTask) => {
        const index = this.tasksList.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasksList[index] = {...this.tasksList[index], ...updatedTask};
        }
      },
      error: (error) => {
        console.error('Error toggling task completion:', error);
      }
    });
  }
  
  filterTasks(filter: 'all' | 'today' | 'week'): void {
    this.activeFilter = filter;
  }
  
  getFilteredTasks(): Task[] {
    let filteredTasks: Task[] = [];
    
    if (this.activeFilter === 'all') {
      filteredTasks = this.tasksList;
    } else if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      filteredTasks = this.tasksList.filter(task => task.dueDate && task.dueDate === today);
    } else if (this.activeFilter === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999); // End of the 7th day
      
      filteredTasks = this.tasksList.filter(task => {
        if (!task.dueDate) return false; // Skip tasks with no due date
        
        // Convert task.dueDate string to Date object properly
        const taskDate = new Date(task.dueDate + 'T00:00:00');
        
        // Check if taskDate is between today and nextWeek (inclusive)
        return taskDate >= today && taskDate <= nextWeek;
      });
    }
    
    return filteredTasks;
  }
}
