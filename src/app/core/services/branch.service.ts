import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Branch } from '../models/branch.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = 'http://localhost:8080/api/branches';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllBranches(): Observable<Branch[]> {
    // Add query parameter to ensure all branches are returned, including inactive ones
    const url = `${this.apiUrl}?includeInactive=true`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(response => {
        // Handle case where response might be wrapped in a data property
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/managers`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    const payload = {
      name: branch.name,
      location: branch.location || (branch as any).address,
      managerId: branch.managerId,
      status: branch.status || 'ACTIVE'
    };
    
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updateBranch(id: number, branch: Partial<Branch>): Observable<Branch> {
    const payload = {
      name: branch.name,
      location: branch.location,
      managerId: branch.managerId,
      status: branch.status
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  deleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateBranchStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  getUnassignedEmployees(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/unassigned-employees`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return Array.isArray(response) ? response : [];
      })
    );
  }
}
