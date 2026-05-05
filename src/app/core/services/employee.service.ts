import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';

export interface Employee {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  mobileCountryCodeId?: number;
  branchId: number;
  roleId: number;
  role?: { id: number; name: string; description?: string };
  roles?: { id: number; name: string; description?: string }[];
  branch?: string;
  status?: string;
  dialCode?: string;
  taskCount?: {
    pending: number;
    inProgress: number;
    completed: number;
  };
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
  private apiUrl = environment.serviceUrl + ApiEndpoint.EMPLOYEES.BASE;
  private http = inject(HttpClient);
  private authService = inject(AuthService);


  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    const payload = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      name: employee.name || `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      phone: employee.phone,
      mobileCountryCodeId: employee.mobileCountryCodeId,
      branchId: Number(employee.branchId),
      roleId: Number(employee.roleId)
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(response => response.data || response)
    );
  }

  updateEmployee(id: string | number, employee: Partial<Employee>): Observable<Employee> {
    const payload = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      name: employee.name || `${employee.firstName} ${employee.lastName}`,
      phone: employee.phone,
      mobileCountryCodeId: employee.mobileCountryCodeId,
      branchId: Number(employee.branchId),
      roleId: Number(employee.roleId)
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(response => response.data || response)
    );
  }

  getAllEmployees(page: number = 0, size: number = 10, search?: string, roleId?: string | number, branchId?: number | string): Observable<PaginatedResponse<Employee>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (roleId) params = params.set('roleId', roleId.toString());
    if (branchId) params = params.set('branchId', branchId.toString());

    return this.http.get<any>(this.apiUrl, { params }).pipe(
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
    return this.http.put(`${this.apiUrl}/${id}/status`, { status: 'INACTIVE' });
  }

  reactivateEmployee(id: string | number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status: 'ACTIVE' });
  }

  deleteEmployee(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAdminEmployees(roleId?: number | string, branchId?: number | string): Observable<Employee[]> {
    let params = new HttpParams();
    if (roleId) {
      params = params.set('roleId', roleId.toString());
    }
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.ADMIN.GET_ALL_EMPLOYEE, { params }).pipe(
      map(response => response.data || response)
    );
  }
}
