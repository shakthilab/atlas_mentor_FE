import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
    return this.http.get<{success: boolean, data: CountryMobileCode[]}>('http://localhost:8080/api/mobile-country-codes')
      .pipe(map(res => res.data));
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<{success: boolean, data: Country[]}>('http://localhost:8080/api/countries')
      .pipe(map(res => res.data));
  }

  getUniversitiesByCountryId(countryId: number | string): Observable<University[]> {
    return this.http.get<{success: boolean, data: University[]}>(`http://localhost:8080/api/universities/country/${countryId}`)
      .pipe(map(res => res.data));
  }
}
