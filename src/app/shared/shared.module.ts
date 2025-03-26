import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ConfirmationService } from './services/confirmation.service';
import { ThemeService } from './services/theme.service';

@NgModule({
  declarations: [
    ConfirmationModalComponent,
    ThemeToggleComponent,
    StatCardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConfirmationModalComponent,
    ThemeToggleComponent,
    StatCardComponent
  ],
  providers: [
    ConfirmationService,
    ThemeService
  ]
})
export class SharedModule { } 