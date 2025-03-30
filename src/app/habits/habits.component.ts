import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Habit } from '../models/habit';
import { AuthService } from '../services/auth.service';
import { HabitsService } from '../services/habits.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  user: firebase.User | null = null;
  habitsList: Habit[] = [];
  activeFilter: 'all' | 'today' | 'week' = 'today';
  isLoading: boolean = false;
  
  // Category icons mapping
  categoryIcons = {
    'health': '🏠',
    'fitness': '💪',
    'productivity': '📈',
    'mindfulness': '🧘',
    'other': '📋'
  };
  
  // Quick habit form
  quickHabitName: string = '';
  quickHabitCategory: string = '';
  quickHabitFrequency: 'daily' | 'weekly' = 'daily';
  
  // Modal form
  modalHabitName: string = '';
  modalHabitCategory: string = '';
  modalHabitFrequency: 'daily' | 'weekly' = 'daily';
  modalHabitDescription: string = '';
  
  // Edit habit
  editingHabit: Habit | null = null;

  constructor(
    private habitsService: HabitsService, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.user = user;
      if (user) {
        this.loadEntries();
      }
    });
  }

  loadEntries() {
    this.isLoading = true;
    this.habitsService.getEntries(this.user?.uid ?? '').subscribe({
      next: (habits) => {
        this.habitsList = habits;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading habits:', error);
        this.isLoading = false;
      }
    });
  }

  createHabit(habit: Habit): void {
    this.isLoading = true;
    this.habitsService.createHabit(habit).subscribe({
      next: (newHabit) => {
        this.habitsList.push(newHabit);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating habit:', error);
        this.isLoading = false;
      }
    });
  }

  updateHabit(habitId: string, updatedHabit: Partial<Habit>): void {
    this.isLoading = true;
    const userId = this.user?.uid ?? '';
    this.habitsService.updateEntry(userId, habitId, updatedHabit).subscribe({
      next: (habit) => {
        const index = this.habitsList.findIndex(h => h.id === habitId);
        if (index !== -1) {
          this.habitsList[index] = {...this.habitsList[index], ...habit};
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating habit:', error);
        this.isLoading = false;
      }
    });
  }

  deleteHabit(habitId: string): void {
    this.isLoading = true;
    const userId = this.user?.uid ?? '';
    this.habitsService.deleteEntry(userId, habitId).subscribe({
      next: () => {
        this.habitsList = this.habitsList.filter(habit => habit.id !== habitId);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting habit:', error);
        this.isLoading = false;
      }
    });
  }

  toggleHabitCompletion(habit: Habit): void {
    if (!habit.id) return;
    
    // Use the new completeHabit method which doesn't require a payload
    this.habitsService.completeHabit(habit.id).subscribe({
      next: (updatedHabit) => {
        const index = this.habitsList.findIndex(h => h.id === habit.id);
        if (index !== -1) {
          this.habitsList[index] = {...this.habitsList[index], ...updatedHabit};
        }
      },
      error: (error) => {
        console.error('Error completing habit:', error);
      }
    });
  }

  addQuickHabit(): void {
    if (!this.quickHabitName || !this.quickHabitCategory || !this.quickHabitFrequency) {
      console.error('Please fill all required fields');
      return;
    }

    const newHabit: Habit = {
      name: this.quickHabitName,
      category: this.quickHabitCategory,
      frequency: this.quickHabitFrequency,
      streak: 0,
      completed: false
    };

    this.createHabit(newHabit);
    
    // Reset form
    this.quickHabitName = '';
    this.quickHabitCategory = '';
    this.quickHabitFrequency = 'daily';
  }

  addModalHabit(): void {
    if (!this.modalHabitName || !this.modalHabitCategory || !this.modalHabitFrequency) {
      console.error('Please fill all required fields');
      return;
    }

    const newHabit: Habit = {
      name: this.modalHabitName,
      category: this.modalHabitCategory,
      frequency: this.modalHabitFrequency,
      description: this.modalHabitDescription,
      streak: 0,
      completed: false
    };

    this.createHabit(newHabit);
    
    // Reset form
    this.modalHabitName = '';
    this.modalHabitCategory = '';
    this.modalHabitFrequency = 'daily';
    this.modalHabitDescription = '';
  }

  openEditModal(habit: Habit): void {
    // Create a copy of the habit to avoid direct modification
    this.editingHabit = { ...habit };
    
    // Open the modal
    const modal = document.getElementById('editHabitModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  saveEditHabit(): void {
    if (!this.editingHabit || !this.editingHabit.id) return;
    
    const habitId = this.editingHabit.id;
    const updatedHabit = { ...this.editingHabit };
    
    // Remove id to avoid sending it in the update call
    delete updatedHabit.id;
    
    this.updateHabit(habitId, updatedHabit);
    this.editingHabit = null;
  }

  getDailyHabitsCount(): number {
    return this.habitsList.filter(habit => habit.frequency === 'daily').length;
  }

  getWeeklyHabitsCount(): number {
    return this.habitsList.filter(habit => habit.frequency === 'weekly').length;
  }

  getCompletedTodayCount(): number {
    return this.habitsList.filter(habit => habit.completed).length;
  }

  getTopStreakHabits(): Habit[] {
    // Sort habits by streak and return the top 3
    return [...this.habitsList]
      .sort((a, b) => (b.streak || 0) - (a.streak || 0))
      .slice(0, 3);
  }

  filterHabits(filter: 'all' | 'today' | 'week'): void {
    this.activeFilter = filter;
  }
  
  getFilteredHabits(): Habit[] {
    if (this.activeFilter === 'all') {
      return this.habitsList;
    } else if (this.activeFilter === 'today') {
      // For habits, "today" filter depends on the frequency and the last completion date
      return this.habitsList.filter(habit => {
        if (habit.frequency === 'daily') {
          return true; // Daily habits are always shown in "today" view
        } else if (habit.frequency === 'weekly') {
          // Check if today is the day of the week this habit should be done
          // This is a simplified example - actual logic would depend on how your app defines weekly habits
          return new Date().getDay() === 1; // Assume Monday is the day for weekly habits
        }
        return false;
      });
    } else if (this.activeFilter === 'week') {
      // For habits, "week" filter includes daily and weekly habits
      return this.habitsList.filter(habit => {
        return habit.frequency === 'daily' || habit.frequency === 'weekly';
      });
    }
    return this.habitsList;
  }

  // Get the icon for a specific category
  getCategoryIcon(category: string): string {
    return this.categoryIcons[category as keyof typeof this.categoryIcons] || '📋';
  }
}
