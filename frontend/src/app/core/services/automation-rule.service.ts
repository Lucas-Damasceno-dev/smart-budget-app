import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AutomationRule, AutomationRuleRequest } from '../models/automation-rule.model';

@Injectable({ providedIn: 'root' })
export class AutomationRuleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/automation-rules`;

  list(): Observable<AutomationRule[]> {
    return this.http.get<AutomationRule[]>(this.baseUrl);
  }

  getById(id: string): Observable<AutomationRule> {
    return this.http.get<AutomationRule>(`${this.baseUrl}/${id}`);
  }

  create(request: AutomationRuleRequest): Observable<AutomationRule> {
    return this.http.post<AutomationRule>(this.baseUrl, request);
  }

  update(id: string, request: AutomationRuleRequest): Observable<AutomationRule> {
    return this.http.put<AutomationRule>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggle(id: string): Observable<AutomationRule> {
    return this.http.post<AutomationRule>(`${this.baseUrl}/${id}/toggle`, {});
  }

  applyToExisting(startDate: string, endDate: string): Observable<{ modifiedCount: number }> {
    return this.http.post<{ modifiedCount: number }>(`${this.baseUrl}/apply`, { startDate, endDate });
  }
}