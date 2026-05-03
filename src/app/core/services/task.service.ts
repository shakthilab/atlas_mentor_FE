import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Task interfaces for type safety
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeName?: string;
  assignerName?: string;
  assignedToId?: number;
  branchName?: string;
  branchId?: number;
  dueDate?: string;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
  updatedAt: string;
  // UI-specific properties (calculated or derived)
  assignee?: string; // For backward compatibility
  assigneeInitial?: string; // For avatar display
  avatarColor?: string; // For avatar background color
  comments?: number; // Comment count
  student?: string; // For backward compatibility
  selected?: boolean; // For UI selection state
}

export interface TaskDetails {
  task: Task;
  comments: TaskComment[];
  activities: Activity[];
}

export interface TaskComment {
  id: number;
  comment: string;
  commentedByName: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  action: string;
  message: string;
  oldValue?: string;
  newValue?: string;
  doneByName: string;
  createdAt: string;
}

export interface TaskFilter {
  search?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedDateFrom?: string;
  assignedDateTo?: string;
  assigneeId?: number;
  branchId?: number;
  createdBy?: number;
  keyword?: string;
  overdue?: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: Task['priority'];
  dueDate?: string;
  assignedToId?: number;
  branchId?: number;
  referenceType?: string;
  referenceId?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  errors?: ValidationError[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    // Get stored user data that contains the token
    const authData = localStorage.getItem('atlas_mentor_auth') || sessionStorage.getItem('atlas_mentor_auth');
    let token = null;
    
    if (authData) {
      try {
        const user = JSON.parse(authData);
        token = user.token;
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    if (error.status === 401) {
      window.location.href = '/login';
    } else if (error.status === 400) {
      console.error('Validation Error:', error.error);
    } else if (error.status === 500) {
      console.error('Server Error:', error.error);
    }
    
    // Return structured error for UI handling
    return throwError(() => ({
      status: error.status,
      message: error.error?.message || 'An error occurred',
      errors: error.error?.errors || []
    }));
  }

  // Core Task Operations
  getTasks(filter?: TaskFilter): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.priority) params = params.set('priority', filter.priority);
      if (filter.dueDateFrom) params = params.set('dueDateFrom', filter.dueDateFrom);
      if (filter.dueDateTo) params = params.set('dueDateTo', filter.dueDateTo);
      if (filter.assignedDateFrom) params = params.set('assignedDateFrom', filter.assignedDateFrom);
      if (filter.assignedDateTo) params = params.set('assignedDateTo', filter.assignedDateTo);
      if (filter.assigneeId) params = params.set('assigneeId', filter.assigneeId.toString());
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.createdBy) params = params.set('createdBy', filter.createdBy.toString());
      if (filter.keyword) params = params.set('keyword', filter.keyword);
      if (filter.overdue !== undefined) params = params.set('overdue', filter.overdue.toString());
    }
    
    return this.http.get<any>(`${this.baseUrl}/tasks`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map((response: any) => {
        // Handle paginated response: { data: { content: [...] } }
        if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        // Handle wrapped non-paginated: { data: [...] }
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array or other
        return Array.isArray(response) ? response : [];
      }),
      catchError(this.handleError)
    );
  }

  getTask(taskId: number): Observable<Task> {
    return this.http.get<any>(`${this.baseUrl}/tasks/${taskId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => response && response.data ? response.data : response),
      catchError(this.handleError)
    );
  }

  getTaskDetails(taskId: number): Observable<TaskDetails> {
    return this.http.get<TaskDetails>(`${this.baseUrl}/tasks/${taskId}/details`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, taskData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => response && response.data ? response.data : response),
      catchError(this.handleError)
    );
  }

  softDeleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${taskId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Task Updates (PUT)
  updateStatus(taskId: number, status: Task['status']): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}/status`, 
      { status }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  assignUser(taskId: number, userId: number): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}/assignee`, 
      { assignedToId: userId }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updatePriority(taskId: number, priority: Task['priority']): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}/priority`, 
      { priority }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateDueDate(taskId: number, dueDate: string): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}/due-date`, 
      { dueDate }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Comments & Activities
  getComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/tasks/${taskId}/comments`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  addComment(taskId: number, comment: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/tasks/${taskId}/comments`, 
      { comment }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getActivity(taskId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/tasks/${taskId}/activity`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
