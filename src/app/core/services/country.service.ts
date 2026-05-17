import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';

export interface CountryMobileCode {
  id: number;
  countryName: string;
  countryCode: string;
  mobileCode: string;
  isoAlpha2: string;
  isoAlpha3: string;
  isActive: boolean;
  flagUrl?: string;
  mobileNumberLength?: number;
}

export interface Country {
  id: number;
  name: string;
}

export interface University {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);
  
  getMobileCountryCodes(): Observable<CountryMobileCode[]> {
    return this.http.get<{success: boolean, data: CountryMobileCode[]}>(environment.serviceUrl + ApiEndpoint.COUNTRIES.MOBILE_CODES)
      .pipe(map(res => res.data));
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<{success: boolean, data: Country[]}>(environment.serviceUrl + ApiEndpoint.COUNTRIES.BASE)
      .pipe(map(res => res.data));
  }

  getUniversitiesByCountryId(countryId: number | string): Observable<University[]> {
    return this.http.get<{success: boolean, data: University[]}>(`${environment.serviceUrl}${ApiEndpoint.UNIVERSITIES.BY_COUNTRY}/${countryId}`)
      .pipe(map(res => res.data));
  }
}
