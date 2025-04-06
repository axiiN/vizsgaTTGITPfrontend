import { Component, OnInit } from '@angular/core';
import {
  addDays,
  addHours,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isToday,
  parse,
  startOfDay
} from 'date-fns';
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
  activeFilter: 'all' | 'today' | 'week' = 'today';
  isLoading: boolean = false;
  showCompleted: boolean = false; // Hide completed tasks by default

  // Quick task form
  quickTaskName: string = '';
  quickTaskPriority: 'high' | 'medium' | 'low' | '' = '';
  quickTaskDueDate: string = '';
  quickTaskDueTime: string = '';

  // Modal form
  modalTaskName: string = '';
  modalTaskPriority: 'high' | 'medium' | 'low' | '' = '';
  modalTaskDueDate: string = '';
  modalTaskDueTime: string = '';
  modalTaskDescription: string = '';

  // Edit task
  editingTask: Task | null = null;

  constructor(
    private tasksService: TasksService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
    
    // Set default due date to today using date-fns
    const now = new Date();
    this.quickTaskDueDate = format(now, 'yyyy-MM-dd');
    this.modalTaskDueDate = this.quickTaskDueDate;
    
    // Set default due time to current hour rounded up to nearest hour
    const nextHour = addHours(now, 1);
    this.quickTaskDueTime = format(nextHour, 'HH:mm');
    this.modalTaskDueTime = this.quickTaskDueTime;
  }
  
  loadTasks(): void {
    this.isLoading = true;
    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        // Process each task to separate date and time
        this.tasksList = tasks.map(task => {
          if (task.dueDate && task.dueDate.includes('T')) {
            try {
              const dateObj = new Date(task.dueDate);
              
              // Extract date and time parts using date-fns
              const datePart = format(dateObj, 'yyyy-MM-dd');
              const timePart = format(dateObj, 'HH:mm');
              
              return {
                ...task,
                dueDate: datePart,
                dueTime: timePart
              };
            } catch (error) {
              console.error('Error parsing date:', error);
              return task;
            }
          }
          return task;
        });
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
    
    // Create a copy to avoid modifying the original task
    const taskToSend = { ...task };
    
    // Combine date and time if both are provided into a proper ISO string
    if (taskToSend.dueDate && taskToSend.dueTime) {
      // Parse the date and time parts using date-fns
      const dateTimeStr = `${taskToSend.dueDate} ${taskToSend.dueTime}`;
      const dateObj = parse(dateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
      
      // Format as complete ISO string
      taskToSend.dueDate = dateObj.toISOString();
      
      // Remove the time property as it's now included in the dueDate
      delete taskToSend.dueTime;
    }
    
    this.tasksService.createTask(taskToSend).subscribe({
      next: (newTask) => {
        // Extract date and time components from ISO string
        if (newTask.dueDate && newTask.dueDate.includes('T')) {
          const dateObj = new Date(newTask.dueDate);
          
          // Extract date and time parts using date-fns
          const datePart = format(dateObj, 'yyyy-MM-dd');
          const timePart = format(dateObj, 'HH:mm');
          
          newTask.dueDate = datePart;
          newTask.dueTime = timePart;
        }
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
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return this.tasksList.filter(task => {
      if (!task.dueDate || task.completed) return false;
      
      // If the due date is today
      return task.dueDate === today;
    }).length;
  }

  getOverdueTasksCount(): number {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return this.tasksList.filter(task => {
      if (!task.dueDate || task.completed) return false;
      
      // If the due date is before today
      return task.dueDate < today;
    }).length;
  }

  getUpcomingTasks(): Task[] {
    // Sort tasks by due date and time, then return the next 3 non-completed tasks
    return this.tasksList
      .filter(task => !task.completed && task.dueDate) // Filter out tasks with no due date
      .sort((a, b) => {
        // Safe comparison with null/undefined checks
        if (!a.dueDate) return 1;  // Push undefined dates to the end
        if (!b.dueDate) return -1; // Push undefined dates to the end
        
        // First compare by date
        const dateComparison = a.dueDate.localeCompare(b.dueDate);
        if (dateComparison !== 0) return dateComparison;
        
        // If dates are equal, compare by time if available
        if (a.dueTime && b.dueTime) {
          return a.dueTime.localeCompare(b.dueTime);
        } else if (a.dueTime) {
          return -1; // Tasks with time come before tasks without time
        } else if (b.dueTime) {
          return 1;  // Tasks with time come before tasks without time
        }
        
        return 0; // Equal if both have no time
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

  formatDateTime(dateString: string, timeString?: string): string {
    if (!dateString) return '';
    
    try {
      // If we have both date and time, combine them
      if (timeString) {
        const dateTimeStr = `${dateString} ${timeString}`;
        const dateObj = parse(dateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
        return format(dateObj, 'MM/dd/yyyy, h:mm a');
      } else {
        // Just format the date part
        const dateObj = parse(dateString, 'yyyy-MM-dd', new Date());
        return format(dateObj, 'MM/dd/yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return `${dateString} ${timeString || ''}`;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const dateObj = parse(dateString, 'yyyy-MM-dd', new Date());
      return format(dateObj, 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  getRelativeDueDate(dateString: string, timeString?: string): string {
    if (!dateString) return '';
    
    try {
      const today = startOfDay(new Date());
      const dueDate = parse(dateString, 'yyyy-MM-dd', new Date());
      
      // Calculate days difference
      const diffDays = differenceInDays(dueDate, today);
      
      let result = '';
      if (diffDays < 0) {
        result = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
      } else if (diffDays === 0) {
        result = 'Due today';
      } else if (diffDays === 1) {
        result = 'Due tomorrow';
      } else {
        result = `Due in ${diffDays} days`;
      }
      
      // Add time if provided
      if (timeString) {
        result += ` at ${this.formatTimeForDisplay(timeString)}`;
      }
      
      return result;
    } catch (error) {
      console.error('Error calculating relative date:', error);
      return `Due: ${dateString}`;
    }
  }

  formatTimeForDisplay(timeString: string): string {
    if (!timeString) return '';
    
    try {
      // Parse the time string and format it with date-fns
      const timeObj = parse(timeString, 'HH:mm', new Date());
      return format(timeObj, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
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
      dueDate: this.quickTaskDueDate,
      dueTime: this.quickTaskDueTime || undefined
    };

    this.createTask(newTask);
    
    // Reset form
    this.quickTaskName = '';
    this.quickTaskPriority = '';
    
    // Set default due date to today
    const now = new Date();
    this.quickTaskDueDate = format(now, 'yyyy-MM-dd');
    
    // Set default due time to next hour
    const nextHour = addHours(now, 1);
    this.quickTaskDueTime = format(nextHour, 'HH:mm');
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
      dueTime: this.modalTaskDueTime || undefined,
      description: this.modalTaskDescription
    };

    this.createTask(newTask);
    
    // Reset form
    this.modalTaskName = '';
    this.modalTaskPriority = '';
    this.modalTaskDescription = '';
    
    // Set default due date to today
    const now = new Date();
    this.modalTaskDueDate = format(now, 'yyyy-MM-dd');
    
    // Set default due time to next hour
    const nextHour = addHours(now, 1);
    this.modalTaskDueTime = format(nextHour, 'HH:mm');
  }
  
  updateTask(id: string, updatedTask: Partial<Task>): void {
    this.isLoading = true;
    
    // Create a copy to avoid modifying the original task
    const taskToUpdate = { ...updatedTask };
    
    // Combine date and time if both are provided into a proper ISO string
    if (taskToUpdate.dueDate && taskToUpdate.dueTime) {
      // Parse the date and time parts using date-fns
      const dateTimeStr = `${taskToUpdate.dueDate} ${taskToUpdate.dueTime}`;
      const dateObj = parse(dateTimeStr, 'yyyy-MM-dd HH:mm', new Date());
      
      // Format as complete ISO string
      taskToUpdate.dueDate = dateObj.toISOString();
      
      // Remove the time property as it's now included in the dueDate
      delete taskToUpdate.dueTime;
    }
    
    this.tasksService.updateTask(id, taskToUpdate).subscribe({
      next: (task) => {
        // Extract date and time components from ISO string
        if (task.dueDate && task.dueDate.includes('T')) {
          const dateObj = new Date(task.dueDate);
          
          // Extract date and time parts using date-fns
          const datePart = format(dateObj, 'yyyy-MM-dd');
          const timePart = format(dateObj, 'HH:mm');
          
          task.dueDate = datePart;
          task.dueTime = timePart;
        }
        
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
      const today = format(new Date(), 'yyyy-MM-dd');
      
      filteredTasks = this.tasksList.filter(task => {
        if (!task.dueDate) return false;
        return task.dueDate === today;
      });
    } else if (this.activeFilter === 'week') {
      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 7);
      
      filteredTasks = this.tasksList.filter(task => {
        if (!task.dueDate) return false;
        
        try {
          const taskDate = parse(task.dueDate, 'yyyy-MM-dd', new Date());
          return (
            isAfter(taskDate, today) || isToday(taskDate)
          ) && (
            isBefore(taskDate, nextWeek) || taskDate.getTime() === nextWeek.getTime()
          );
        } catch (error) {
          console.error('Error parsing date for filter:', error);
          return false;
        }
      });
    }
    
    // Filter out completed tasks if showCompleted is false
    if (!this.showCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }
    
    return filteredTasks;
  }

  // Add a method to toggle the showCompleted property
  toggleShowCompleted(): void {
    this.showCompleted = !this.showCompleted;
  }
}
