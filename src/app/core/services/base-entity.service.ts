import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseEntityService<T> {
  protected http = inject(HttpClient);
  protected authService = inject(AuthService);

  abstract get endpoint(): string;

  /**
   * Get current user's branch (for non-admin users)
   */
  protected getCurrentUserBranch(): string | null {
    const currentUser = this.authService.currentUserValue;
    const userRole = currentUser?.role?.toUpperCase();
    
    // Only return branch for non-admin users
    if (userRole && userRole !== 'ADMIN') {
      return currentUser?.branch || null;
    }
    
    return null; // Admin users can see all branches
  }

  /**
   * Build HTTP params with automatic branch filtering for non-admin users
   */
  protected buildParams(params?: {
    page?: number;
    size?: number;
    search?: string;
    branchId?: number | string;
    [key: string]: any;
  }): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return this.addBranchFilter(httpParams);
    }

    // Add provided parameters
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.addBranchFilter(httpParams);
  }

  /**
   * Automatically add branch filter for non-admin users if not already specified
   */
  private addBranchFilter(params: HttpParams): HttpParams {
    const userBranch = this.getCurrentUserBranch();
    
    // Add branch filter for non-admin users if not already specified
    if (userBranch && !params.has('branch')) {
      params = params.set('branch', userBranch);
    }

    return params;
  }

  /**
   * Generic get all method with automatic branch filtering
   */
  getAll(params?: {
    page?: number;
    size?: number;
    search?: string;
    branchId?: number | string;
    [key: string]: any;
  }): Observable<any> {
    const httpParams = this.buildParams(params);
    return this.http.get(`${this.endpoint}`, { params: httpParams });
  }

  /**
   * Generic get by ID method
   */
  getById(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`);
  }

  /**
   * Generic create method - automatically adds branch for non-admin users
   */
  create(data: any): Observable<T> {
    const userBranch = this.getCurrentUserBranch();
    
    // Auto-add branch for non-admin users if not present
    if (userBranch && !data.branch) {
      data = { ...data, branch: userBranch };
    }

    return this.http.post<T>(this.endpoint, data);
  }

  /**
   * Generic update method
   */
  update(id: string | number, data: any): Observable<T> {
    return this.http.put<T>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Generic delete method
   */
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
