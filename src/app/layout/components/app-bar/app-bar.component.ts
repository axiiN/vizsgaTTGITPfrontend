import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-app-bar',
  templateUrl: './app-bar.component.html',
  styleUrls: ['./app-bar.component.css']
})
export class AppBarComponent implements OnInit {
  @Input() user: firebase.User | null = null;
  @Input() title: string = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
  
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
  
  logout(): void {
    this.authService.logout();
  }
} 