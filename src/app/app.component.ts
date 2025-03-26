import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthRoute = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Set initial auth route status
    const currentUrl = this.router.url;
    this.isAuthRoute = currentUrl === '/' || 
                       currentUrl === '/login' || 
                       currentUrl === '/register' || 
                       currentUrl === '/auth';
    
    // Monitor route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.isAuthRoute = event.url === '/' || 
                          event.url.includes('/login') || 
                          event.url.includes('/register') || 
                          event.url.includes('/auth');
        
        // If we're on the auth route and already logged in, redirect to notes
        if (this.isAuthRoute) {
          this.authService.getCurrentUser()
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
              if (user && (event.url === '/' || 
                          event.url === '/login' || 
                          event.url === '/register' || 
                          event.url === '/auth')) {
                this.router.navigate(['/notes']);
              }
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
