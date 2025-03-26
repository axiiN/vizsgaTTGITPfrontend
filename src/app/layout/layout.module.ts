import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AppBarComponent } from './components/app-bar/app-bar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';

@NgModule({
  declarations: [
    SidebarComponent,
    AppBarComponent,
    DashboardLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    DashboardLayoutComponent
  ]
})
export class LayoutModule { } 