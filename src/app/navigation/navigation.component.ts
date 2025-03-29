import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent implements OnInit {
  user: firebase.User | null = null;

  constructor(
    private auth: AuthService,
  ) {}

  logout(): void {
    this.auth.logout()
  }

  ngOnInit(): void {
    // Figyeljük a felhasználó állapotát
    this.auth.getCurrentUser().subscribe((user) => {
      this.user = user;
      console.log('Auth state changed:', user);
    });
  }
}
