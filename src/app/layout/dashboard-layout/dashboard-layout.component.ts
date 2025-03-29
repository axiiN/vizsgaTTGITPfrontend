import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
  private readonly DESKTOP_BREAKPOINT = 992; // Bootstrap lg breakpoint
  private isDesktopView = false; // Track the current view type

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

    // Check initial screen size
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Listen for window resize events
  @HostListener('window:resize')
  onResize() {
    const wasDesktop = this.isDesktopView;
    const isNowDesktop = window.innerWidth >= this.DESKTOP_BREAKPOINT;
    
    // If transitioning between desktop and mobile, handle appropriately
    if (wasDesktop !== isNowDesktop) {
      console.log(`Screen size transition: ${wasDesktop ? 'Desktop->Mobile' : 'Mobile->Desktop'}`);
    }
    
    this.checkScreenSize();
  }

  // Check if we're on desktop and ensure sidebar is expanded
  private checkScreenSize(): void {
    this.isDesktopView = window.innerWidth >= this.DESKTOP_BREAKPOINT;
    
    if (this.isDesktopView) {
      // On desktop, always show sidebar
      this.sidebarCollapsed = false;
    } else {
      // On mobile/tablet, collapse sidebar by default
      this.sidebarCollapsed = true;
    }
  }

  toggleSidebar(): void {
    // Only allow toggle on mobile devices
    if (window.innerWidth < this.DESKTOP_BREAKPOINT) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
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