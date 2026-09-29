import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(data: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    profileImage?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => this.setSession(response))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((response) => this.setSession(response)));
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    this.currentUserSubject.next(response.data.user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getMe(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(
      `${this.apiUrl}/me`
    );
  }
}
