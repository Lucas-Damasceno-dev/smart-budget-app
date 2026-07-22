import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import {
  Subscription,
  SubscriptionRequest,
  SubscriptionSummary,
} from '../models/subscription.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  create(request: SubscriptionRequest): Observable<ApiResponse<Subscription>> {
    return this.http.post<ApiResponse<Subscription>>(this.apiUrl, request);
  }

  list(status?: string): Observable<ApiResponse<Subscription[]>> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<ApiResponse<Subscription[]>>(this.apiUrl, { params });
  }

  getSummary(): Observable<ApiResponse<SubscriptionSummary>> {
    return this.http.get<ApiResponse<SubscriptionSummary>>(
      `${this.apiUrl}/summary`
    );
  }

  get(id: string): Observable<ApiResponse<Subscription>> {
    return this.http.get<ApiResponse<Subscription>>(`${this.apiUrl}/${id}`);
  }

  update(
    id: string,
    request: SubscriptionRequest
  ): Observable<ApiResponse<Subscription>> {
    return this.http.put<ApiResponse<Subscription>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  cancel(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  pause(id: string): Observable<ApiResponse<Subscription>> {
    return this.http.put<ApiResponse<Subscription>>(
      `${this.apiUrl}/${id}/pause`,
      {}
    );
  }

  resume(id: string): Observable<ApiResponse<Subscription>> {
    return this.http.put<ApiResponse<Subscription>>(
      `${this.apiUrl}/${id}/resume`,
      {}
    );
  }
}
