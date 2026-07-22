import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '../models/api.model';
import { ReportResponse } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getReport(startDate: string, endDate: string): Observable<ApiResponse<ReportResponse>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<ReportResponse>>(this.apiUrl, { params });
  }

  getMonthlyReport(month?: number, year?: number): Observable<ApiResponse<ReportResponse>> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month.toString());
    if (year !== undefined) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<ReportResponse>>(`${this.apiUrl}/monthly`, { params });
  }

  getYearlyReport(year?: number): Observable<ApiResponse<ReportResponse>> {
    let params = new HttpParams();
    if (year !== undefined) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<ReportResponse>>(`${this.apiUrl}/yearly`, { params });
  }

  exportCsv(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/export/csv`, {
      params,
      responseType: 'blob',
    });
  }
}
