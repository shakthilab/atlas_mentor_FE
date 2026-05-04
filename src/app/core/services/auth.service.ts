import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    userId: number;
    name: string;
    email: string;
    role: string;
    type: string;
    employee?: boolean; // Flag to identify employee users (API sends 'employee')
  };
  timestamp: string;
  statusCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'atlas_mentor_auth';
  private readonly USERS_KEY = 'atlas_mentor_users';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  private sessionExpiredSubject = new BehaviorSubject<boolean>(false);
  public sessionExpired$: Observable<boolean> = this.sessionExpiredSubject.asObservable();
  
  private apiUrl = 'http://65.2.175.37:8080/api/auth';
  private studentApiUrl = 'http://65.2.175.37:8080/api/students';
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.initializeMockUsers();
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }

  private setStoredUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.AUTH_KEY);
    }
    this.currentUserSubject.next(user);
  }

  private initializeMockUsers() {
    const existing = localStorage.getItem(this.USERS_KEY);
    if (!existing) {
      const mockUsers: User[] = [
        { id: '1', name: 'Admin User', email: 'admin@atlas.com', role: 'Admin', status: 'ACTIVE' },
        { id: '2', name: 'Manager User', email: 'manager@atlas.com', role: 'Manager', status: 'ACTIVE' },
        { id: '3', name: 'Jane Student', email: 'jane@student.com', role: 'Student', status: 'ACTIVE' }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(mockUsers));
    }
  }

  getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  login(email: string, password?: string): Observable<User | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        if (response.success && response.data) {
          const apiUser = response.data;
          const user: User = {
            id: apiUser.userId.toString(),
            name: apiUser.name,
            email: apiUser.email,
            role: apiUser.role, // This will be 'STUDENT', 'ADMIN', etc.
            token: apiUser.token,
            isEmployee: apiUser.employee || false, // Flag to identify employee users (API sends 'employee')
            branchId: (apiUser as any).branchId || (apiUser as any).branch?.id,
            status: 'ACTIVE'
          };
          this.setStoredUser(user);
          return user;
        }
        return null;
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Invalid email or password.';
        throw new Error(errorMessage);
      })
    );
  }

  logout(): void {
    this.setStoredUser(null);
    this.sessionExpiredSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  handleSessionExpired(): void {
    console.log('AuthService: Setting sessionExpired to true');
    if (!this.sessionExpiredSubject.value) {
      this.sessionExpiredSubject.next(true);
    }
  }

  registerStudent(studentData: any): Observable<any> {
    return this.http.post(`${this.studentApiUrl}/register`, studentData).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      })
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email`, { params: { token } }).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Email verification failed.';
        throw new Error(errorMessage);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams().set('email', email);
    
    return this.http.post(`${this.apiUrl}/forgot-password`, body.toString(), { headers }).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to send reset link.';
        throw new Error(errorMessage);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    
    return this.http.post(`${this.apiUrl}/reset-password`, body.toString(), { headers }).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Failed to reset password.';
        throw new Error(errorMessage);
      })
    );
  }

  registerEmployee(employeeData: Partial<User>): Observable<User> {
    return of(null).pipe(
      delay(1000),
      tap(() => {
        const users = this.getUsers();
        if (users.find(u => u.email === employeeData.email)) {
          throw new Error('Email already exists');
        }
        const newUser: User = {
          ...employeeData,
          id: Math.random().toString(36).substr(2, 9),
          role: 'Employee', // Role might change upon approval
          status: 'PENDING_APPROVAL',
          name: employeeData.name || '',
          email: employeeData.email || ''
        } as User;
        
        users.push(newUser);
        this.saveUsers(users);
      }),
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delay(0) as any
    );
  }

  // Admin Function
  approveUser(userId: string, role: User['role'], branch: string): Observable<boolean> {
    return of(true).pipe(
      delay(500),
      tap(() => {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
          users[userIndex].status = 'ACTIVE';
          users[userIndex].role = role;
          users[userIndex].branch = branch;
          this.saveUsers(users);
        }
      })
    );
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
