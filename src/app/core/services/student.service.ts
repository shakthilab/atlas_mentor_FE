import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/students';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getStudents(page: number = 0, size: number = 10, search: string = '', status: string = ''): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (search) url += `&keyword=${search}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getStudentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  createStudent(student: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, student, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updateStudent(id: string, student: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, student, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }
}
