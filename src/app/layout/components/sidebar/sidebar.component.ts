import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() user: firebase.User | null = null;
  @Input() pageTitle: string = '';
  
  navigationItems = [
    { route: '/notes', icon: 'bi bi-journal', label: 'Notes' },
    { route: '/tasks', icon: 'bi bi-check2-square', label: 'Tasks' },
    { route: '/habits', icon: 'bi bi-calendar-check', label: 'Habits' }
  ];
  
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    // We no longer need to subscribe to getCurrentUser here
    // since we're getting the user from @Input
  }
  
  getUserInitials(): string {
    if (!this.user) return '';
    
    // If user has a display name, use that
    if (this.user.displayName) {
      const nameParts = this.user.displayName.trim().split(' ');
      if (nameParts.length >= 2) {
        // Get first letter of first and last name
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        // Get first letter if only one name
        return nameParts[0].charAt(0).toUpperCase();
      }
    }
    
    // Fall back to email if no display name
    if (this.user.email) {
      return this.user.email.charAt(0).toUpperCase();
    }
    
    // Default
    return 'U';
  }
} 