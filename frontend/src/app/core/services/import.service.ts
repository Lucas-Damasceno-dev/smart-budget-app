import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ImportPreview, ImportConfirmRequest, ImportLog, ImportHistory } from '../models/import.model';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/imports`;

  preview(file: File, accountId: string): Observable<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', accountId);
    return this.http.post<ImportPreview>(`${this.baseUrl}/preview`, formData);
  }

  confirm(request: ImportConfirmRequest): Observable<ImportLog> {
    return this.http.post<ImportLog>(`${this.baseUrl}/confirm`, request);
  }

  getHistory(): Observable<ImportHistory> {
    return this.http.get<ImportHistory>(this.baseUrl);
  }

  getRecent(): Observable<ImportLog[]> {
    return this.http.get<ImportLog[]>(`${this.baseUrl}/recent`);
  }
}