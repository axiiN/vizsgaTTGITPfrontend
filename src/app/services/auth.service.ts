import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { CoreApiService } from './core-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private coreApiService: CoreApiService
  ) {}

  async register(email: string, password: string, username: string) {
    try {
      const userCredential: firebase.auth.UserCredential =
        await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      if (user) {
        await user.updateProfile({ displayName: username });
        await user.reload();

        await this.db.object(`users/${user.uid}`).set({
          uid: user.uid,
          email: user.email,
          username: username,
          createdAt: Date.now()
        });
        
        // Send welcome email
        this.sendWelcomeEmail(email, username);
        
        // Navigate to habits page on successful registration
        this.router.navigate(['/habits']);
      }
      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Rethrow to allow component to handle it
    }
  }

  /**
   * Send welcome email to newly registered user
   */
  private sendWelcomeEmail(email: string, name: string) {
    this.coreApiService.post('users/welcome-email', { email, name })
      .subscribe({
        next: (response) => console.log('Welcome email sent successfully:', response),
        error: (error) => console.error('Failed to send welcome email:', error)
      });
  }

  async login(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      
      // Navigate to habits page on successful login
      if (result && result.user) {
        this.router.navigate(['/habits']);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Rethrow to allow component to handle it
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }
}
