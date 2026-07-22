import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import {
  InstallmentGroup,
  InstallmentRequest,
  InstallmentEditRequest,
} from '../models/installment.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class InstallmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/installments`;

  create(request: InstallmentRequest): Observable<ApiResponse<InstallmentGroup>> {
    return this.http.post<ApiResponse<InstallmentGroup>>(this.apiUrl, request);
  }

  list(): Observable<ApiResponse<InstallmentGroup[]>> {
    return this.http.get<ApiResponse<InstallmentGroup[]>>(this.apiUrl);
  }

  get(id: string): Observable<ApiResponse<InstallmentGroup>> {
    return this.http.get<ApiResponse<InstallmentGroup>>(`${this.apiUrl}/${id}`);
  }

  update(
    id: string,
    request: InstallmentEditRequest
  ): Observable<ApiResponse<InstallmentGroup>> {
    return this.http.put<ApiResponse<InstallmentGroup>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  cancel(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
