import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '../models/api.model';
import { Goal, GoalDepositRequest, GoalRequest } from '../models/goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/goals`;

  getGoals(): Observable<ApiResponse<Goal[]>> {
    return this.http.get<ApiResponse<Goal[]>>(this.apiUrl);
  }

  getGoal(id: string): Observable<ApiResponse<Goal>> {
    return this.http.get<ApiResponse<Goal>>(`${this.apiUrl}/${id}`);
  }

  createGoal(request: GoalRequest): Observable<ApiResponse<Goal>> {
    return this.http.post<ApiResponse<Goal>>(this.apiUrl, request);
  }

  updateGoal(id: string, request: GoalRequest): Observable<ApiResponse<Goal>> {
    return this.http.put<ApiResponse<Goal>>(`${this.apiUrl}/${id}`, request);
  }

  depositToGoal(id: string, request: GoalDepositRequest): Observable<ApiResponse<Goal>> {
    return this.http.post<ApiResponse<Goal>>(`${this.apiUrl}/${id}/deposit`, request);
  }

  deleteGoal(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
