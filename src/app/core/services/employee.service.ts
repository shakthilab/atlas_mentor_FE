import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Employee {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  branchId: number;
  roleId: number;
  role?: { id: number; name: string; description?: string };
  roles?: { id: number; name: string; description?: string }[];
  branch?: string;
  status?: string;
  taskCount?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    console.log('Token available:', !!token);
    if (!token) {
      console.warn('No authentication token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    const payload = {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      branchId: Number(employee.branchId),
      roleId: Number(employee.roleId)
    };
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updateEmployee(id: string | number, employee: Partial<Employee>): Observable<Employee> {
    const payload = {
      name: employee.name,
      phone: employee.phone,
      branchId: Number(employee.branchId),
      roleId: Number(employee.roleId)
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getAllEmployees(page: number = 0, size: number = 10, search?: string, role?: string, branch?: number | string): Observable<PaginatedResponse<Employee>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (branch) params = params.set('branch', branch.toString());

    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders(), params }).pipe(
      map(response => {
        console.log('Raw API response:', response);
        if (response.data && response.data.content !== undefined) {
          console.log('Using response.data as PaginatedResponse', response.data);
          return response.data as PaginatedResponse<Employee>;
        }
        return response as PaginatedResponse<Employee>;
      })
    );
  }

  deactivateEmployee(id: string | number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status: 'INACTIVE' }, { headers: this.getHeaders() });
  }

  reactivateEmployee(id: string | number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status: 'ACTIVE' }, { headers: this.getHeaders() });
  }

  deleteEmployee(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAdminEmployees(roleId?: number | string): Observable<Employee[]> {
    let params = new HttpParams();
    if (roleId) {
      params = params.set('roleId', roleId.toString());
    }
    return this.http.get<any>(`http://localhost:8080/api/admin/get-all-employee`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      map(response => response.data || response)
    );
  }
}
