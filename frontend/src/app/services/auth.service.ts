import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  isSuccess: boolean;
  data: {
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
    access_token: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'access_token';
  private userKey = 'user_data';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.user$.pipe(map((user) => !!user));

  constructor() {
    // Load user from localStorage only if both token and user data exist
    const token = this.getToken();
    const userData = this.getUserData();

    if (token && userData) {
      this.userSubject.next(userData);
    } else {
      // If either is missing, clear both to ensure consistency
      this.clearStorage();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login response:', response);
          if (response.isSuccess) {
            console.log('Token:', response.data.access_token);
            console.log('User:', response.data.user);
            this.setToken(response.data.access_token);
            this.setUserData(response.data.user);
            this.userSubject.next(response.data.user);
            console.log('Data saved to localStorage');
          }
        }),
      );
  }

  logout(): void {
    this.clearStorage();
    this.userSubject.next(null);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getUserData(): any {
    const userData = localStorage.getItem(this.userKey);
    if (!userData || userData === 'undefined' || userData === 'null') {
      return null;
    }
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  setUserData(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }
}
