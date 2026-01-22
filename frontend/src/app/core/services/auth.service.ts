// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

export interface User {
  id?: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clientId?: number;
  profileImageUrl?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
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
  role?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/v1/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<string> {
    return this.http.post(`${this.API_URL}/change-password`, passwordData, { responseType: 'text' });
  }

  verifyTwoFactor(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-2fa`, { code })
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}, { responseType: 'text' })
      .pipe(
        tap(() => {
          this.clearStorage();
          this.currentUserSubject.next(null);
        }),
        catchError(() => {
          // Même en cas d'erreur, on nettoie le storage local
          this.clearStorage();
          this.currentUserSubject.next(null);
          return of('Déconnexion effectuée localement');
        })
      );
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
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refresh_token: refreshToken })
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
    const accessToken = response.access_token;
    const refreshToken = response.refresh_token;

    const accessPayload = this.parseJwt(accessToken);
    const accessExpiry = accessPayload?.exp ? accessPayload.exp * 1000 : Date.now() + (response.expires_in || 3600) * 1000;

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('token_type', response.token_type || 'Bearer');
    localStorage.setItem('token_expiry', accessExpiry.toString());

    const refreshPayload = this.parseJwt(refreshToken);
    const refreshExpiryDays = refreshPayload?.exp
      ? Math.max(1, (refreshPayload.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
      : 7;

    this.cookieService.set(
      'refresh_token',
      refreshToken,
      refreshExpiryDays,
      '/',
      environment.domain,
      environment.production,
      'Strict'
    );

    const user: User = {
      id: accessPayload?.sub ? Number(accessPayload.sub) : undefined,
      username: response.username,
      firstName: accessPayload?.firstName,
      lastName: accessPayload?.lastName,
      email: accessPayload?.email,
      role: response.role
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);

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
    localStorage.removeItem('token_type');
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
}
