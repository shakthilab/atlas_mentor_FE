import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Role {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://65.2.175.37:8080/api/roles';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        // Handle case where response might be wrapped in a data property
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return Array.isArray(response) ? response : [];
      })
    );
  }
}
