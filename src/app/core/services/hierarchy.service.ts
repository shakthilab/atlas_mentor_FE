import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {
  private apiUrl = environment.serviceUrl + ApiEndpoint.HIERARCHY.BASE;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token || ''}`
    });
  }

  private mapHierarchyResponse(response: any, forcedRole?: string): any[] {
    const dataList = response?.data || [];
    return dataList.map((item: any) => ({
      leader: {
        id: item.id,
        name: item.name,
        branch: item.branch?.name || 'Unknown Branch',
        branchId: item.branch?.id
      },
      members: (item.employees || item.juniorCounsellors || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        activeStudents: emp.activeStudents || emp.studentsAssigned || 0,
        role: emp.role, // Preserve the role field from API response
        roles: (emp.roles && emp.roles.length > 0) ? emp.roles : (forcedRole ? [forcedRole] : [])
      }))
    }));
  }

  getManagersHierarchy(): Observable<any[]> {
    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.HIERARCHY.MANAGERS, { headers: this.getHeaders() }).pipe(
      map(response => this.mapHierarchyResponse(response))
    );
  }

  getCounsellorsHierarchy(): Observable<any[]> {
    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.HIERARCHY.COUNSELLORS, { headers: this.getHeaders() }).pipe(
      map(response => this.mapHierarchyResponse(response, 'JUNIOR_COUNSELLOR'))
    );
  }

  getUsersByRole(role: string, branchId: number): Observable<any[]> {
    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.HIERARCHY.USERS_BY_ROLE, { 
      headers: this.getHeaders(),
      params: { role, branchId: branchId.toString() } 
    }).pipe(
      map(response => response?.data || [])
    );
  }

  assignEmployees(payload: { roleId: number, managerId: number, userIds: number[] }): Observable<any> {
    return this.http.post<any>(environment.serviceUrl + ApiEndpoint.HIERARCHY.ASSIGN_EMPLOYEES_BY_ROLES, payload, {
      headers: this.getHeaders()
    });
  }

  getJuniorCounsellors(branchId: number): Observable<any[]> {
    return this.http.get<any>(`${environment.serviceUrl}${ApiEndpoint.HIERARCHY.BASE}/junior-counsellors`, { 
      headers: this.getHeaders(),
      params: { branchId: branchId.toString() }
    }).pipe(
      map(response => response?.data || [])
    );
  }

  assignJuniorCounsellors(payload: { seniorCounsellorId: number, juniorCounsellorIds: number[] }): Observable<any> {
    return this.http.post<any>(environment.serviceUrl + ApiEndpoint.HIERARCHY.ASSIGN_JUNIORS, payload, {
      headers: this.getHeaders()
    });
  }

  unassignEmployee(employeeId: number): Observable<any> {
    return this.http.delete<any>(`${environment.serviceUrl}${ApiEndpoint.HIERARCHY.UNASSIGN_EMPLOYEE}/${employeeId}`, {
      headers: this.getHeaders()
    });
  }

  unassignJuniorCounsellor(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.serviceUrl}${ApiEndpoint.HIERARCHY.UNASSIGN_JUNIOR}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
