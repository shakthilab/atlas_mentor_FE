import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';
import { AuthService } from './auth.service';

export type ScheduleType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';
export type BundleStatus = 'ACTIVE' | 'INACTIVE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface BundleTask {
  id?: number;
  title: string;
  description: string;
  priority: TaskPriority;
  defaultDueDays: number;
}

export interface TaskBundleSchedule {
  scheduleType: ScheduleType;
  executionTime: string; // HH:mm
  startDate: string; // YYYY-MM-DD
  weekDay?: string; // For WEEKLY
  dayOfMonth?: number; // For MONTHLY
  executionDate?: string; // For ONE_TIME
  executionDay?: string; // New field from backend
  executionDayOfMonth?: number; // New field from backend
  oneTimeExecutionDate?: string; // New field from backend
}

export interface TaskBundle {
  id?: number;
  name: string;
  description?: string;
  roleId?: number | string;
  role?: any;
  roleName?: string;
  status: BundleStatus;
  schedule?: TaskBundleSchedule;
  tasks?: BundleTask[];
  totalTasks?: number;
  lastExecuted?: string;
  nextExecution?: string;
  // Legacy fields for UI compatibility if needed
  scheduleType?: ScheduleType;
  executionTime?: string;
  startDate?: string;
  weekDay?: string;
  dayOfMonth?: number;
  executionDate?: string;
  // New fields matching the backend API
  activeTaskCount?: number;
  formattedScheduleType?: string;
  formattedStatus?: string;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
}

export interface BundleFilter {
  search?: string;
  roleId?: number | string;
  status?: BundleStatus | string;
  scheduleType?: ScheduleType | string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskBundleService {
  private readonly baseUrl = environment.serviceUrl + ApiEndpoint.TASK_BUNDLES.BASE;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('TaskBundleService Error:', error);
    return throwError(() => ({
      status: error.status,
      message: error.error?.message || 'An error occurred',
      errors: error.error?.errors || []
    }));
  }

  getBundles(filter?: BundleFilter): Observable<any> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.roleId && filter.roleId !== 'undefined' && filter.roleId !== 'null' && filter.roleId !== '') {
        params = params.set('roleId', filter.roleId.toString());
      }
      if (filter.status && filter.status !== 'undefined' && filter.status !== 'null' && filter.status !== '') {
        params = params.set('status', filter.status);
      }
      if (filter.scheduleType && filter.scheduleType !== 'undefined' && filter.scheduleType !== 'null' && filter.scheduleType !== '') {
        params = params.set('scheduleType', filter.scheduleType);
      }
    }

    return this.http.get<any>(this.baseUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  getBundleById(id: number): Observable<TaskBundle> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  createBundle(data: Partial<TaskBundle>): Observable<TaskBundle> {
    return this.http.post<any>(this.baseUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  updateBundle(id: number, data: Partial<TaskBundle>): Observable<TaskBundle> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  deleteBundle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  activateBundle(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deactivateBundle(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  executeBundle(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/execute-now`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getExecutionStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/execution-stats`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  // Task-specific operations inside a bundle
  getTasksInBundle(bundleId: number): Observable<BundleTask[]> {
    return this.http.get<any>(`${this.baseUrl}/${bundleId}/tasks`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response?.data) return Array.isArray(response.data) ? response.data : (response.data.tasks || []);
        if (Array.isArray(response)) return response;
        if (response?.tasks && Array.isArray(response.tasks)) return response.tasks;
        if (response?.content) return response.content;
        return [];
      }),
      catchError(this.handleError)
    );
  }

  addBundleTask(bundleId: number, taskData: BundleTask): Observable<BundleTask> {
    return this.http.post<any>(`${this.baseUrl}/${bundleId}/tasks`, taskData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  updateBundleTask(bundleId: number, taskId: number, taskData: BundleTask): Observable<BundleTask> {
    return this.http.put<any>(`${this.baseUrl}/${bundleId}/tasks/${taskId}`, taskData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response?.data || response),
      catchError(this.handleError)
    );
  }

  deleteBundleTask(bundleId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${bundleId}/tasks/${taskId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
