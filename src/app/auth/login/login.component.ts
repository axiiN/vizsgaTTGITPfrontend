import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  
  errorMessages: {
    email: string;
    password: string;
    general: string;
  } = {
    email: '',
    password: '',
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
    
    return isValid;
  }

  async login() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      const result = await this.auth.login(this.email, this.password);
      if (!result) {
        this.errorMessages.general = 'Invalid email or password';
      }
    } catch (error: any) {
      console.log(error.message);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }
  
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  
  handleAuthError(error: any) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.code) {
      switch (error.code) {
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
        default:
          errorMessage = 'An error occurred during login';
          this.errorMessages.general = errorMessage;
      }
    } else {
      this.errorMessages.general = errorMessage;
    }
  }
}
