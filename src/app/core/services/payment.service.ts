import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { ApiEndpoint } from '../constants/endpoint.def';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.serviceUrl + ApiEndpoint.PAYMENTS.BASE;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createPayment(paymentData: any): Observable<any> {
    const url = `${environment.serviceUrl}/api/client-payouts/${paymentData.clientPayoutId}/add-payment`;
    const payload = {
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference || ('TXN' + Math.floor(Math.random() * 1000000)),
      notes: paymentData.notes
    };
    return this.http.post<any>(url, payload, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updatePayment(id: number | string, payment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payment, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  approvePayment(id: number | string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, {}, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  rejectPayment(id: number | string, reason: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, { reason }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getPaymentById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getPaymentsByStudent(studentId: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getPendingPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getPaidPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paid`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getRejectedPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rejected`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getPaymentsByStatus(status: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status/${status}`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getPaymentTransactions(studentId: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${studentId}/transactions`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  getClientPayoutActivities(payoutId: number | string): Observable<any> {
    return this.http.get<any>(`${environment.serviceUrl}/api/client-payouts/${payoutId}/activities`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  raiseDispute(paymentId: number | string, disputeReason: string): Observable<any> {
    const url = `${environment.serviceUrl}/api/client-payouts/${paymentId}/dispute`;
    return this.http.post<any>(url, { disputeReason }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  resolveDispute(paymentId: number | string, notes: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${paymentId}/resolve-dispute`, { notes }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  processRejection(paymentId: number | string, status: 'APPROVED' | 'REJECTED', notes: string, proof?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${paymentId}/process-rejection`, { status, notes, proof }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updatePaymentAmount(paymentId: number | string, assignedAmount: number, notes: string): Observable<any> {
    const url = environment.serviceUrl + ApiEndpoint.PAYMENTS.UPDATE_AMOUNT;
    return this.http.put<any>(url, { clientPayoutId: paymentId, assignedAmount, notes }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updatePaymentStatus(paymentId: number | string, paymentStatus: string, notes: string): Observable<any> {
    const url = environment.serviceUrl + ApiEndpoint.PAYMENTS.UPDATE_STATUS;
    return this.http.put<any>(url, { paymentId, paymentStatus, notes }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  acceptDispute(paymentId: number | string, response: string): Observable<any> {
    const url = `${environment.serviceUrl}/api/payments/payouts/${paymentId}/dispute/accept`;
    return this.http.post<any>(url, { response }, { headers: this.getHeaders() }).pipe(
      map(res => res.data || res)
    );
  }

  rejectDispute(paymentId: number | string, response: string): Observable<any> {
    const url = `${environment.serviceUrl}/api/payments/payouts/${paymentId}/dispute/reject`;
    return this.http.post<any>(url, { response }, { headers: this.getHeaders() }).pipe(
      map(res => res.data || res)
    );
  }
}
