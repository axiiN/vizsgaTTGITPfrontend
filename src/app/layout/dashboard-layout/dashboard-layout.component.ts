import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Subject } from 'rxjs';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  user: firebase.User | null = null;
  sidebarCollapsed = false;
  pageTitle = '';
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get user information
    this.auth.getCurrentUser().pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
      
      // If user is not authenticated, redirect to auth page
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    // Get page title from route data
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.pageTitle = data['title'] || this.getDefaultTitle();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Get default title based on current URL if no title is provided in route data
  private getDefaultTitle(): string {
    const url = this.router.url;
    if (url.includes('/notes')) return 'Notes';
    if (url.includes('/tasks')) return 'Tasks';
    if (url.includes('/habits')) return 'Habits';
    return 'Dashboard';
  }
} 