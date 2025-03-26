import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  
  errorMessages: {
    email: string;
    password: string;
    username: string;
    general: string;
  } = {
    email: '',
    password: '',
    username: '',
    general: ''
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  clearErrors() {
    this.errorMessages = {
      email: '',
      password: '',
      username: '',
      general: ''
    };
  }
  
  validateForm(): boolean {
    let isValid = true;
    this.clearErrors();
    
    if (!this.email || !this.email.includes('@')) {
      this.errorMessages.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!this.password || this.password.length < 6) {
      this.errorMessages.password = 'Password must be at least 6 characters long';
      isValid = false;
    }
    
    if (!this.username || this.username.length < 3) {
      this.errorMessages.username = 'Username must be at least 3 characters long';
      isValid = false;
    }
    
    return isValid;
  }

  async register() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      const result = await this.auth.register(this.email, this.password, this.username);
      if (!result) {
        this.errorMessages.general = 'An error occurred during registration. Please try again.';
      }
    } catch (error: any) {
      console.log(error.message);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  handleAuthError(error: any) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use';
          this.errorMessages.email = errorMessage;
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          this.errorMessages.email = errorMessage;
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          this.errorMessages.password = errorMessage;
          break;
        default:
          errorMessage = 'An error occurred during registration';
          this.errorMessages.general = errorMessage;
      }
    } else {
      this.errorMessages.general = errorMessage;
    }
  }
}
