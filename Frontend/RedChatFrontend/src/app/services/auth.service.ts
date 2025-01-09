import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/jwtPayload.model';


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

  register(username: string, password: string): Observable<any> {
    const { privateKeyPem, publicKeyPem } = this.encryptionService.generateNewKeyPair();
    return this.http.post(`${this.apiUrl}/register`, { 
      username, 
      password,
      publicKey: publicKeyPem 
    }).pipe(
      map(response => ({
        ...response,
        privateKey: privateKeyPem
      }))
    );
  }

  getAllUsernames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/getUsernames`);
  }


  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      map((response: any) => {
        if (response.token && response.userId) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticated$.next(true);
        }
        return response;
      })
    );
  }
  
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