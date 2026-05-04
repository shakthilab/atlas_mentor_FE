import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://65.2.175.37:8080/api/payments';
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
    const payload = {
      studentId: paymentData.studentId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod, // e.g. 'BANK_TRANSFER', 'UPI', 'CASH'
      transactionType: 'CREDIT',
      transactionReference: paymentData.transactionReference || ('TXN' + Date.now()),
      notes: paymentData.notes
    };
    return this.http.post<any>(`${this.apiUrl}/transactions`, payload, { headers: this.getHeaders() }).pipe(
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
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}/transactions`, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  raiseDispute(paymentId: number | string, disputeReason: string): Observable<any> {
    const url = `http://65.2.175.37:8080/api/payments/${paymentId}/dispute`;
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
    const url = 'http://65.2.175.37:8080/api/students/payment/amount';
    return this.http.put<any>(url, { paymentId, assignedAmount, notes }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  updatePaymentStatus(paymentId: number | string, paymentStatus: string, notes: string): Observable<any> {
    const url = 'http://65.2.175.37:8080/api/students/payment/status';
    return this.http.put<any>(url, { paymentId, paymentStatus, notes }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  acceptDispute(paymentId: number | string, response: string): Observable<any> {
    const url = `http://65.2.175.37:8080/api/payments/${paymentId}/dispute/accept`;
    return this.http.post<any>(url, { response, acceptDispute: true }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }

  rejectDispute(paymentId: number | string, response: string): Observable<any> {
    const url = `http://65.2.175.37:8080/api/payments/${paymentId}/dispute/reject`;
    return this.http.post<any>(url, { response, acceptDispute: false }, { headers: this.getHeaders() }).pipe(
      map(response => response.data || response)
    );
  }
}
