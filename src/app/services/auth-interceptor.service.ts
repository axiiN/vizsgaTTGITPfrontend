import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, from, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only intercept requests to our API
    if (!req.url.includes(environment.apiUrl)) {
      console.log('Skipping non-API request:', req.url);
      return next.handle(req);
    }
    
    console.log('Intercepting API request:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));
    
    // Get the token and add it to the request
    return from(this.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.log('No auth token available, proceeding without authentication');
          return next.handle(req);
        }
        
        console.log('Adding auth token to request:', req.url);
        console.log('Token preview:', token.substring(0, 10) + '...');
        
        // Clone the request and add the auth header
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Modified request headers:', authReq.headers.keys().map(key => `${key}: ${authReq.headers.get(key)}`));
        
        // Pass the cloned request to the next handler
        return next.handle(authReq).pipe(
          tap(event => {
            console.log('Response from intercepted request:', req.url, event);
          })
        );
      })
    );
  }
  
  /**
   * Get the authentication token
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      console.log('Getting auth token from AuthService');
      const user = await firstValueFrom(this.authService.getCurrentUser());
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }
      
      console.log('User found:', user.uid);
      const token = await user.getIdToken();
      console.log('Retrieved token:', token ? `Token available (${token.length} chars)` : 'No token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
} 