import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';

export interface Company {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
  mobileCountryCodeId?: number;
  firstName?: string;
  lastName?: string;
  role?: string;
  isVerified?: boolean;
  status?: string;
  branch?: {
    id: number;
    name: string;
    location: string;
    status: string;
  };
  companyDetails?: {
    id: number;
    companyName: string;
    contactPerson: string;
    address: string;
    website: string;
    industry: string;
    assignedTo: number;
  };
  // Fallback fields for creation/legacy
  industry?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  branchId?: number;
  assignedTo?: number;
}

export interface CompanyResponse {
  content: Company[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = environment.serviceUrl + ApiEndpoint.COMPANIES.BASE;
  private http = inject(HttpClient);
  private authService = inject(AuthService);


  createCompany(company: Partial<Company>): Observable<any> {
    return this.http.post<any>(environment.serviceUrl + ApiEndpoint.COMPANIES.CREATE, company).pipe(
      map(response => response.data || response)
    );
  }

  getCompanies(page: number = 0, size: number = 10, search: string = ''): Observable<CompanyResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);

    return this.http.get<any>(environment.serviceUrl + ApiEndpoint.COMPANIES.LIST, { params }).pipe(
      map(response => {
        // If data is directly the paginated response
        if (response.content !== undefined) {
          return response;
        }
        return response.data || response;
      })
    );
  }

  deleteCompany(id: number | string): Observable<any> {
    return this.http.delete<any>(`${environment.serviceUrl}${ApiEndpoint.COMPANIES.DELETE}/${id}`);
  }

  updateCompanyStatus(id: number | string): Observable<any> {
    return this.http.put<any>(`${environment.serviceUrl}${ApiEndpoint.COMPANIES.TOGGLE_STATUS}/${id}`, {});
  }

  updateCompany(id: number | string, company: Partial<Company>): Observable<any> {
    return this.http.put<any>(`${environment.serviceUrl}${ApiEndpoint.COMPANIES.EDIT}/${id}`, company).pipe(
      map(response => response.data || response)
    );
  }
}
