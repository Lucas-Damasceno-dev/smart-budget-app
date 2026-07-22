import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { environment } from '@environments/environment';

export interface InvoiceData {
  accountId: string;
  accountName: string;
  cycleStart: string;
  cycleEnd: string;
  dueDate: string;
  totalAmount: number;
  totalPaid: number;
  remainingBalance: number;
  items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  transactionId: string;
  description: string;
  amount: number;
  date: string;
  categoryName: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts`;

  getInvoice(
    accountId: string,
    month?: string
  ): Observable<ApiResponse<InvoiceData>> {
    const params: Record<string, string> = {};
    if (month) params['month'] = month;
    return this.http.get<ApiResponse<InvoiceData>>(
      `${this.apiUrl}/${accountId}/invoice`,
      { params }
    );
  }

  payInvoice(
    accountId: string,
    sourceAccountId: string
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${accountId}/invoice/pay`,
      { sourceAccountId }
    );
  }
}
