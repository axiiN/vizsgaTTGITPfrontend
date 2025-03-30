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
    // Set default due date to today
    const today = new Date().toISOString().split('T')[0];
    this.quickTaskDueDate = today;
    this.modalTaskDueDate = today;
    
    // Set default due time to current hour rounded up to nearest hour
    const now = new Date();
    now.setMinutes(0, 0, 0); // Reset minutes, seconds, and milliseconds
    now.setHours(now.getHours() + 1); // Set to next hour
    const defaultTime = now.toTimeString().substring(0, 5); // Format as HH:MM
    this.quickTaskDueTime = defaultTime;
    this.modalTaskDueTime = defaultTime;
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
              
              // Extract date part in YYYY-MM-DD format
              const datePart = dateObj.toISOString().split('T')[0];
              
              // Extract time part in HH:MM format
              const timePart = `${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}`;
              
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
      // Parse the date and time parts
      const [year, month, day] = taskToSend.dueDate.split('-').map(Number);
      const [hours, minutes] = taskToSend.dueTime.split(':').map(Number);
      
      // Create a date object (months are 0-indexed in JavaScript)
      const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      
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
          
          // Extract date part in YYYY-MM-DD format
          const datePart = dateObj.toISOString().split('T')[0];
          
          // Extract time part in HH:MM format
          const timePart = `${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}`;
          
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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.tasksList.filter(task => {
      if (!task.dueDate || task.completed) return false;
      
      // If the due date is today
      if (task.dueDate === todayStr) {
        return true;
      }
      
      return false;
    }).length;
  }

  getOverdueTasksCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const todayStr = today.toISOString().split('T')[0];
    
    return this.tasksList.filter(task => {
      if (!task.dueDate || task.completed) return false;
      
      // If the due date is before today
      if (task.dueDate < todayStr) {
        return true;
      }
      
      return false;
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
    
    const date = new Date(dateString);
    
    // If time is provided, set the time part
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
      date.setHours(hours, minutes, 0, 0);
    }
    
    // Format as "MM/DD/YYYY, HH:MM AM/PM" or just "MM/DD/YYYY" if no time
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: timeString ? '2-digit' : undefined,
      minute: timeString ? '2-digit' : undefined
    };
    
    return date.toLocaleString(undefined, options);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getRelativeDueDate(dateString: string, timeString?: string): string {
    if (!dateString) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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
  }

  formatTimeForDisplay(timeString: string): string {
    if (!timeString) return '';
    
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
    const today = new Date().toISOString().split('T')[0];
    this.quickTaskDueDate = today;
    
    // Set default due time to current hour rounded up to nearest hour
    const now = new Date();
    now.setMinutes(0, 0, 0); // Reset minutes, seconds, and milliseconds
    now.setHours(now.getHours() + 1); // Set to next hour
    this.quickTaskDueTime = now.toTimeString().substring(0, 5); // Format as HH:MM
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
    const today = new Date().toISOString().split('T')[0];
    this.modalTaskDueDate = today;
    
    // Set default due time to current hour rounded up to nearest hour
    const now = new Date();
    now.setMinutes(0, 0, 0); // Reset minutes, seconds, and milliseconds
    now.setHours(now.getHours() + 1); // Set to next hour
    this.modalTaskDueTime = now.toTimeString().substring(0, 5); // Format as HH:MM
  }
  
  updateTask(id: string, updatedTask: Partial<Task>): void {
    this.isLoading = true;
    
    // Create a copy to avoid modifying the original task
    const taskToUpdate = { ...updatedTask };
    
    // Combine date and time if both are provided into a proper ISO string
    if (taskToUpdate.dueDate && taskToUpdate.dueTime) {
      // Parse the date and time parts
      const [year, month, day] = taskToUpdate.dueDate.split('-').map(Number);
      const [hours, minutes] = taskToUpdate.dueTime.split(':').map(Number);
      
      // Create a date object (months are 0-indexed in JavaScript)
      const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      
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
          
          // Extract date part in YYYY-MM-DD format
          const datePart = dateObj.toISOString().split('T')[0];
          
          // Extract time part in HH:MM format
          const timePart = `${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}`;
          
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
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filteredTasks = this.tasksList.filter(task => {
        if (!task.dueDate) return false;
        
        // If the due date is today
        return task.dueDate === todayStr;
      });
    } else if (this.activeFilter === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999); // End of the 7th day
      
      filteredTasks = this.tasksList.filter(task => {
        if (!task.dueDate) return false; // Skip tasks with no due date
        
        // Convert task.dueDate string to Date object properly
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        // Check if taskDate is between today and nextWeek (inclusive)
        return taskDate >= today && taskDate <= nextWeek;
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
