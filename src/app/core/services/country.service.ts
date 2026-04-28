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
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);
  
  getMobileCountryCodes(): Observable<CountryMobileCode[]> {
    return this.http.get<{success: boolean, data: CountryMobileCode[]}>('http://localhost:8080/api/mobile-country-codes')
      .pipe(map(res => res.data));
  }
}
