import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();
  
  constructor() {
    this.loadSavedTheme();
  }
  
  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme) {
      // If a theme preference was saved, use it
      this.setDarkMode(savedTheme === 'dark');
    } else {
      // Otherwise, check if user's system prefers dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }
  }
  
  public toggleTheme(): void {
    this.setDarkMode(!this.isDarkModeSubject.value);
  }
  
  public setDarkMode(isDark: boolean): void {
    // Update the subject
    this.isDarkModeSubject.next(isDark);
    
    // Save preference to localStorage
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    
    // Apply theme to document
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  
  public getCurrentTheme(): string {
    return this.isDarkModeSubject.value ? 'dark' : 'light';
  }
} 