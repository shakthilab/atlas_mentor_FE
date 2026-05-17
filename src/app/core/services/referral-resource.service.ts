import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';
import { ReferralResource, ReferralResourceRequest, ReferralResourcePage } from '../models/referral-resource.model';

@Injectable({
  providedIn: 'root'
})
export class ReferralResourceService {
  private apiUrl = environment.serviceUrl + ApiEndpoint.REFERRAL_RESOURCES.BASE;
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

  createResource(resource: ReferralResourceRequest): Observable<ReferralResource> {
    return this.http.post<any>(this.apiUrl, resource, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updateResource(id: number, resource: ReferralResourceRequest): Observable<ReferralResource> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, resource, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  deleteResource(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getResourceById(id: number): Observable<ReferralResource> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getResourcesByOwner(ownerId: number, ownerType: string): Observable<ReferralResource[]> {
    const params = new HttpParams().set('ownerType', ownerType);
    return this.http.get<any>(`${environment.serviceUrl}${ApiEndpoint.REFERRAL_RESOURCES.OWNER}/${ownerId}`, { 
      headers: this.getHeaders(), 
      params 
    }).pipe(
      map(response => response.data || response)
    );
  }

  getAllResources(
    page: number = 0, 
    size: number = 10, 
    ownerId?: number, 
    ownerType?: string, 
    resourceType?: string,
    search?: string
  ): Observable<ReferralResourcePage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (ownerId) params = params.set('ownerId', ownerId.toString());
    if (ownerType) params = params.set('ownerType', ownerType);
    if (resourceType) params = params.set('resourceType', resourceType);
    if (search) params = params.set('search', search);

    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders(), params }).pipe(
      map(response => response.data || response)
    );
  }

  getMyResources(): Observable<ReferralResource[]> {
    return this.http.get<any>(`${environment.serviceUrl}${ApiEndpoint.REFERRAL_RESOURCES.MY_RESOURCES}`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => response.data || response)
    );
  }
}
