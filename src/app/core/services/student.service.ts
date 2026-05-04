import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://65.2.175.37:8080/api/students';
  private http = inject(HttpClient);
  private authService = inject(AuthService);


  getStudents(page: number = 0, size: number = 10, search: string = '', status: string = ''): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (search) url += `&keyword=${search}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(
      map(response => response.data || response)
    );
  }

  getRegisteredStudents(page: number = 0, size: number = 10, search: string = '', status: string = ''): Observable<any> {
    let url = `${this.apiUrl}/registered?page=${page}&size=${size}`;
    if (search) url += `&keyword=${search}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(
      map(response => response.data || response)
    );
  }

  getNonRegisteredStudents(page: number = 0, size: number = 10, search: string = '', status: string = ''): Observable<any> {
    let url = `${this.apiUrl}/non-registered?page=${page}&size=${size}`;
    if (search) url += `&keyword=${search}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(
      map(response => response.data || response)
    );
  }

  getStudentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  createStudent(student: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, student).pipe(
      map(response => response.data || response)
    );
  }

  updateStudent(id: string, student: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, student).pipe(
      map(response => response.data || response)
    );
  }

  getRequiredDocuments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/required-documents`).pipe(
      map(response => response.data || response)
    );
  }

  onboardStudent(student: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/onboarding`, student).pipe(
      map(response => response.data || response)
    );
  }

  getStudentByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-email/${email}`).pipe(
      map(response => response.data || response)
    );
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  updateStudentStatus(id: string | number, status: string, notes: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status, notes }).pipe(
      map(response => response.data || response)
    );
  }

  getStudentsWithPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/with-payment-by-referral-company`).pipe(
      map(response => response.data || response)
    );
  }
}
