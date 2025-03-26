import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  isLoginMode: boolean = true;
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

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.resetForm();
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  resetForm() {
    this.email = '';
    this.password = '';
    this.username = '';
    this.clearErrors();
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
    
    if (!this.isLoginMode && (!this.username || this.username.length < 3)) {
      this.errorMessages.username = 'Username must be at least 3 characters long';
      isValid = false;
    }
    
    return isValid;
  }

  async authenticate() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      if (this.isLoginMode) {
        const result = await this.auth.login(this.email, this.password);
        if (!result) {
          this.errorMessages.general = 'Invalid email or password';
        }
      } else {
        const result = await this.auth.register(this.email, this.password, this.username);
        if (!result) {
          this.errorMessages.general = 'An error occurred during registration. Please try again.';
        }
      }
    } catch (error: any) {
      console.log(error.message);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
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
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email';
          this.errorMessages.email = errorMessage;
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          this.errorMessages.password = errorMessage;
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          this.errorMessages.password = errorMessage;
          break;
        default:
          errorMessage = 'An error occurred during login/registration';
          this.errorMessages.general = errorMessage;
      }
    } else {
      this.errorMessages.general = errorMessage;
    }
  }
}
