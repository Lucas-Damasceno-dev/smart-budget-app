import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  Investment,
  InvestmentRequest,
  InvestmentSummary,
} from '../models/investment.model';

@Injectable({
  providedIn: 'root',
})
export class InvestmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/investments`;

  getInvestments(): Observable<ApiResponse<Investment[]>> {
    return this.http.get<ApiResponse<Investment[]>>(this.apiUrl);
  }

  getSummary(): Observable<ApiResponse<InvestmentSummary>> {
    return this.http.get<ApiResponse<InvestmentSummary>>(`${this.apiUrl}/summary`);
  }

  getInvestment(id: string): Observable<ApiResponse<Investment>> {
    return this.http.get<ApiResponse<Investment>>(`${this.apiUrl}/${id}`);
  }

  createInvestment(request: InvestmentRequest): Observable<ApiResponse<Investment>> {
    return this.http.post<ApiResponse<Investment>>(this.apiUrl, request);
  }

  updateInvestment(id: string, request: InvestmentRequest): Observable<ApiResponse<Investment>> {
    return this.http.put<ApiResponse<Investment>>(`${this.apiUrl}/${id}`, request);
  }

  deleteInvestment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
