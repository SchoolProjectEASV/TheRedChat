import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/jwtPayload.model';

/**
 * The authservice is responsible for handling user authentication, registration, and token management.
 * 
 * @remarks
 * This service manages JWT tokens for authentication, stores them in localStorage,
 * and provides methods for user registration with public/private key generation.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private apiUrl = 'http://localhost:8080/api/auth';
  public isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient, 
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

   /**
   * Registers a new user with the application.
   * Generates a new key pair for end-to-end encryption as part of the registration process.
   * 
   * @param username - user's username
   * @param password - The user's password
   * @returns Observable that emits registration status updates and final result
   */
  
  register(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      observer.next({ status: 'generating-keys' });
      
      setTimeout(() => {
        try {
          const { privateKeyPem, publicKeyPem } = this.encryptionService.generateNewKeyPair();
          
          this.http.post(`${this.apiUrl}/register`, { 
            username, 
            password,
            publicKey: publicKeyPem 
          }).subscribe({
            next: (response) => {
              observer.next({ 
                status: 'complete', 
                data: {
                  ...response,
                  privateKey: privateKeyPem
                }
              });
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        } catch (error) {
          observer.error(error);
        }
      }, 100);
    });
}

  getAllUsernames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/getUsernames`);
  }


    /**
   * Authenticates a user with the application.
   * Stores the JWT token in localStorage upon authentication.
   * 
   * @param username - The user's username
   * @param password - The user's password
   * @returns Observable of the login response containing the JWT token
   */

  login(username: string, password: string): Observable<any> {
    this.logout(); 
    
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      map((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticated$.next(true);
        }
        return response;
      })
    );
}
  
    /**
   * Extracts the user ID from the JWT token.
   * 
   * @returns The user's unique identifier
   * @throws Error if token is missing or invalid
   */
  
  getUserId(): string {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      if (!userId) {
        throw new Error('User ID not found in token payload');
      }
      
      return userId;
    } catch (error) {
      throw new Error('Failed to parse user ID from token');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated$.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    
    return !!this.getToken();
  }
}