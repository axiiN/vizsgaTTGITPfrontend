import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoreApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Error handling method
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
      console.error('Client-side error occurred:', error.error.message);
    } else {
      // Server-side error
      errorMessage = `Server-side error: Status Code: ${error.status}, Message: ${error.message}`;
      console.error('Server returned error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });
    }
    
    // Log full error for debugging
    console.error('Full error details:', error);
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`GET Request to: ${url}`, params ? `with params: ${JSON.stringify(params)}` : '');
    return this.http.get<T>(url, { params })
      .pipe(
        tap(response => console.log(`GET Response from ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic GET by ID request
   */
  getById<T>(endpoint: string, id: string): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}/${id}`;
    console.log(`GET by ID Request to: ${url}`);
    return this.http.get<T>(url)
      .pipe(
        tap(response => console.log(`GET by ID Response from ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`POST Request to: ${url}`, 'with data:', data);
    return this.http.post<T>(url, data)
      .pipe(
        tap(response => console.log(`POST Response from ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, id: string, data: any): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}/${id}`;
    console.log(`PUT Request to: ${url}`, 'with data:', data);
    return this.http.put<T>(url, data)
      .pipe(
        tap(response => console.log(`PUT Response from ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, id: string, data: any): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}/${id}`;
    console.log(`PATCH Request to: ${url}`, 'with data:', data);
    return this.http.patch<T>(url, data)
      .pipe(
        tap(response => console.log(`PATCH Response from ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string, id: string): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}/${id}`;
    console.log(`DELETE Request to: ${url}`);
    return this.http.delete<T>(url)
      .pipe(
        tap(response => console.log(`DELETE Response from ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PATCH request for custom path (e.g. /tasks/:id/toggle)
   */
  patchCustomPath<T>(customPath: string, data: any): Observable<T> {
    const url = `${this.apiUrl}/${customPath}`;
    console.log(`PATCH Request to custom path: ${url}`, 'with data:', data);
    return this.http.patch<T>(url, data)
      .pipe(
        tap(response => console.log(`PATCH Response from custom path ${url}:`, response)),
        catchError(this.handleError)
      );
  }

  /**
   * Generic POST request to a custom path
   */
  postCustomPath<T>(customPath: string, data: any = {}): Observable<T> {
    const url = `${this.apiUrl}/${customPath}`;
    console.log(`POST Request to custom path: ${url}`, 'with data:', data);
    return this.http.post<T>(url, data)
      .pipe(
        tap(response => console.log(`POST Response from custom path ${url}:`, response)),
        catchError(this.handleError)
      );
  }
} 