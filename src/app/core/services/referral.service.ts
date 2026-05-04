import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Referral {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  mobileCountryCodeId?: number;
  referralType: string;
  branchId?: number;
  branch?: {
    id: number;
    name: string;
    location?: string;
  };
  leads?: number;
  registered?: number;
  conversion?: number;
  payout?: number;
  status?: string;
  assignedToUsername?: string;
}

export interface ReferralResponse {
  content: Referral[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiUrl = 'http://65.2.175.37:8080/api/referral';
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

  getReferralTypes(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/types`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  createReferral(referral: Partial<Referral>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, referral, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getReferrals(page: number = 0, size: number = 10, search: string = '', referralType: string = '', branchId: string = ''): Observable<ReferralResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (referralType) params = params.set('referralType', referralType);
    if (branchId) params = params.set('branchId', branchId);

    return this.http.get<any>(`${this.apiUrl}/list`, { headers: this.getHeaders(), params }).pipe(
      map(response => response.data || response)
    );
  }

  deleteReferral(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`, { headers: this.getHeaders() });
  }

  updateReferralStatus(id: number | string, status: 'ACTIVE' | 'INACTIVE'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/status/${id}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  updateReferral(id: number | string, referral: Partial<Referral>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, referral, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }
}
