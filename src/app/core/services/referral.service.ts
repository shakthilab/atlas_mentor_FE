import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';

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
  private apiUrl = environment.serviceUrl + ApiEndpoint.REFERRALS.BASE;
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
    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.REFERRALS.TYPES, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  createReferral(referral: Partial<Referral>): Observable<any> {
    return this.http.post<any>(environment.serviceUrl + ApiEndpoint.REFERRALS.CREATE, referral, { headers: this.getHeaders() }).pipe(
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

    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.REFERRALS.LIST, { headers: this.getHeaders(), params }).pipe(
      map(response => response.data || response)
    );
  }

  deleteReferral(id: number | string): Observable<any> {
    return this.http.delete<any>(`${environment.serviceUrl}${ApiEndpoint.REFERRALS.DELETE}/${id}`, { headers: this.getHeaders() });
  }

  updateReferralStatus(id: number | string, status: 'ACTIVE' | 'INACTIVE'): Observable<any> {
    return this.http.put<any>(`${environment.serviceUrl}${ApiEndpoint.REFERRALS.STATUS}/${id}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  updateReferral(id: number | string, referral: Partial<Referral>): Observable<any> {
    return this.http.put<any>(`${environment.serviceUrl}${ApiEndpoint.REFERRALS.UPDATE}/${id}`, referral, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }
}
