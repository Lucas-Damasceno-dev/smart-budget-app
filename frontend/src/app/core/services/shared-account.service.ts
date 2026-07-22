import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  AccountShare,
  ShareAccountRequest,
  ExpenseSplit,
  CreateExpenseSplitRequest,
} from '../models/shared-account.model';

@Injectable({ providedIn: 'root' })
export class SharedAccountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/shared-accounts`;

  shareAccount(request: ShareAccountRequest): Observable<ApiResponse<AccountShare>> {
    return this.http.post<ApiResponse<AccountShare>>(this.apiUrl, request);
  }

  getMyShares(): Observable<ApiResponse<AccountShare[]>> {
    return this.http.get<ApiResponse<AccountShare[]>>(this.apiUrl);
  }

  revokeShare(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  createSplit(request: CreateExpenseSplitRequest): Observable<ApiResponse<ExpenseSplit>> {
    return this.http.post<ApiResponse<ExpenseSplit>>(`${this.apiUrl}/splits`, request);
  }

  getMySplits(): Observable<ApiResponse<ExpenseSplit[]>> {
    return this.http.get<ApiResponse<ExpenseSplit[]>>(`${this.apiUrl}/splits`);
  }

  settleSplit(id: string): Observable<ApiResponse<ExpenseSplit>> {
    return this.http.post<ApiResponse<ExpenseSplit>>(`${this.apiUrl}/splits/${id}/settle`, {});
  }
}
