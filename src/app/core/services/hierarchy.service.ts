import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {
  private apiUrl = 'http://localhost:8080/api/hierarchy';
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
    return this.http.get<any>(`${this.apiUrl}/managers`, { headers: this.getHeaders() }).pipe(
      map(response => this.mapHierarchyResponse(response))
    );
  }

  getCounsellorsHierarchy(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/counsellors`, { headers: this.getHeaders() }).pipe(
      map(response => this.mapHierarchyResponse(response, 'JUNIOR_COUNSELLOR'))
    );
  }

  getUsersByRole(role: string, branchId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/users-by-role`, { 
      headers: this.getHeaders(),
      params: { role, branchId: branchId.toString() } 
    }).pipe(
      map(response => response?.data || [])
    );
  }

  assignEmployees(payload: { roleId: number, managerId: number, userIds: number[] }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/assign-employee-by-roles`, payload, {
      headers: this.getHeaders()
    });
  }

  getJuniorCounsellors(branchId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/junior-counsellors`, { 
      headers: this.getHeaders(),
      params: { branchId: branchId.toString() }
    }).pipe(
      map(response => response?.data || [])
    );
  }

  assignJuniorCounsellors(payload: { seniorCounsellorId: number, juniorCounsellorIds: number[] }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/assign-junior-counsellors`, payload, {
      headers: this.getHeaders()
    });
  }

  unassignEmployee(employeeId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/unassign-employee/${employeeId}`, {
      headers: this.getHeaders()
    });
  }

  unassignJuniorCounsellor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/unassign-junior-counsellor/${id}`, {
      headers: this.getHeaders()
    });
  }
}
