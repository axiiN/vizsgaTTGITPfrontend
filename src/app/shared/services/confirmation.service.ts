import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationConfig {
  title?: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
  modalId?: string;
  data?: any; // Optional data to pass with the confirmation
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<any>();
  private configSubject = new Subject<ConfirmationConfig>();
  
  // Observable that components can subscribe to for confirmation events
  public confirmation$: Observable<any> = this.confirmationSubject.asObservable();
  
  // Observable that the confirmation component can subscribe to for configuration
  public config$: Observable<ConfirmationConfig> = this.configSubject.asObservable();
  
  // Default configuration
  private defaultConfig: ConfirmationConfig = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed with this action?',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    confirmButtonClass: 'btn-primary',
    modalId: 'globalConfirmationModal'
  };
  
  /**
   * Open a confirmation dialog
   * @param config Configuration for the confirmation modal
   * @returns An Observable that emits true when confirmed, false when canceled
   */
  confirm(config: ConfirmationConfig = {}): Observable<boolean> {
    // Merge provided config with defaults
    const modalConfig = { ...this.defaultConfig, ...config };
    
    // Emit the configuration for the confirmation component
    this.configSubject.next(modalConfig);
    
    // Show the modal programmatically
    setTimeout(() => {
      const modal = document.getElementById(modalConfig.modalId || 'globalConfirmationModal');
      if (modal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    });
    
    // Return an Observable that will emit once the user confirms or cancels
    const result = new Subject<boolean>();
    
    // Set up a one-time subscription to handle the user's response
    const subscription = this.confirmation$.subscribe(response => {
      result.next(response.confirmed);
      result.complete();
      subscription.unsubscribe();
    });
    
    return result.asObservable();
  }
  
  /**
   * Called by the confirmation component when the user confirms
   */
  confirm_action(data?: any): void {
    this.confirmationSubject.next({ confirmed: true, data });
  }
  
  /**
   * Called by the confirmation component when the user cancels
   */
  cancel_action(data?: any): void {
    this.confirmationSubject.next({ confirmed: false, data });
  }
} 