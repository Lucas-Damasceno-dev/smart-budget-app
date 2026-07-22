import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '../models/api.model';
import { Insight, Forecast, PeriodComparison, CategoryDrilldown } from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;

  getInsights(): Observable<ApiResponse<Insight[]>> {
    return this.http.get<ApiResponse<Insight[]>>(`${this.apiUrl}/insights`);
  }

  getForecast(days: number = 30): Observable<ApiResponse<Forecast>> {
    return this.http.get<ApiResponse<Forecast>>(`${this.apiUrl}/forecast?days=${days}`);
  }

  getPeriodComparison(month?: number, year?: number): Observable<ApiResponse<PeriodComparison>> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<PeriodComparison>>(`${this.apiUrl}/period-comparison`, { params });
  }

  getCategoryDrilldown(categoryId: string, startDate?: string, endDate?: string): Observable<ApiResponse<CategoryDrilldown>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<CategoryDrilldown>>(`${this.apiUrl}/category-drilldown/${categoryId}`, { params });
  }
}