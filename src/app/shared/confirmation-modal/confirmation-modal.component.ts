import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationConfig, ConfirmationService } from '../services/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed with this action?';
  @Input() confirmButtonText: string = 'Confirm';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() confirmButtonClass: string = 'btn-danger';
  @Input() modalId: string = 'globalConfirmationModal';
  @Input() data: any = null;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  private configSubscription: Subscription | null = null;
  
  constructor(private confirmationService: ConfirmationService) {}
  
  ngOnInit(): void {
    // Subscribe to configuration changes
    this.configSubscription = this.confirmationService.config$.subscribe(
      (config: ConfirmationConfig) => {
        // Apply configuration from service if any of these values are defined
        this.title = config.title || this.title;
        this.message = config.message || this.message;
        this.confirmButtonText = config.confirmButtonText || this.confirmButtonText;
        this.cancelButtonText = config.cancelButtonText || this.cancelButtonText;
        this.confirmButtonClass = config.confirmButtonClass || this.confirmButtonClass;
        this.data = config.data || this.data;
        
        // Only update modalId if it's defined in the config
        if (config.modalId) {
          this.modalId = config.modalId;
        }
      }
    );
  }
  
  ngOnDestroy(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }
  
  onConfirm(): void {
    // Emit both locally and to the service
    this.confirm.emit();
    this.confirmationService.confirm_action(this.data);
    this.closeModal();
  }
  
  onCancel(): void {
    // Emit both locally and to the service
    this.cancel.emit();
    this.confirmationService.cancel_action(this.data);
    this.closeModal();
  }
  
  private closeModal(): void {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }
} 