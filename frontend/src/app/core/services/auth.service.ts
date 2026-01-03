// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  clientId?: number;
  profileImageUrl?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  twoFactorRequired: boolean;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/v1/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Mode DEMO - désactiver l'authentification pour le développement
  private readonly DEMO_MODE = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.loadUserFromStorage();
    // En mode DEMO, créer un utilisateur fictif
    if (this.DEMO_MODE) {
      this.initDemoUser();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // MODE DEMO: Accepter n'importe quelles credentials et retourner un utilisateur fictif
    if (this.DEMO_MODE) {
      const demoResponse: AuthResponse = {
        token: 'demo_token_' + Date.now(),
        refreshToken: 'demo_refresh_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 86400000, // 24 heures
        user: {
          id: 1,
          username: credentials.username || 'demo_user',
          email: 'demo@banqueega.tn',
          firstName: 'Admin',
          lastName: 'Demo',
          role: 'ADMIN',
          phoneNumber: '+216 98 765 432'
        },
        twoFactorRequired: false,
        message: 'Login successful (DEMO MODE)'
      };
      
      this.handleAuthentication(demoResponse);
      return new Observable(observer => {
        observer.next(demoResponse);
        observer.complete();
      });
    }

    // Mode production: utiliser l'API réelle
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (!response.twoFactorRequired) {
            this.handleAuthentication(response);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  verifyTwoFactor(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-2fa`, { code })
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  logout(): void {
    const refreshToken = this.cookieService.get('refresh_token');
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken }).subscribe();
    }
    
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Vérifier l'expiration du token
    const tokenData = this.parseJwt(token);
    if (!tokenData || !tokenData.exp) return false;
    
    return Date.now() < tokenData.exp * 1000;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token') || this.cookieService.get('auth_token');
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.cookieService.get('refresh_token');
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthentication(response, false))
      );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return roles.includes(user?.role || '');
  }

  private handleAuthentication(response: AuthResponse, isLogin: boolean = true): void {
    // Stocker les tokens
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('token_expiry', (Date.now() + response.expiresIn).toString());
    
    // Stocker le refresh token dans un cookie sécurisé
    this.cookieService.set(
      'refresh_token',
      response.refreshToken,
      response.expiresIn / 1000 / 60 / 60 / 24, // en jours
      '/',
      environment.domain,
      environment.production,
      'Strict'
    );
    
    // Stocker les informations utilisateur
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    
    // Rediriger après login
    if (isLogin) {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user');
    this.cookieService.delete('refresh_token', '/', environment.domain);
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  private initDemoUser(): void {
    // Créer un utilisateur fictif pour le mode démo
    const demoUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@banqueega.tn',
      firstName: 'Admin',
      lastName: 'Système',
      role: 'ADMIN',
      phoneNumber: '+216 98 765 432',
      profileImageUrl: 'https://via.placeholder.com/150'
    };

    // Stocker le token fictif
    const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIERlbW8iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.demo_token';
    localStorage.setItem('access_token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token_expiry', (Date.now() + 86400000).toString());
    
    this.currentUserSubject.next(demoUser);
  }
}