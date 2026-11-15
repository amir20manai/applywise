import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { Interview, InterviewPayload, InterviewStatus } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class InterviewApi {
  private http = inject(HttpClient);

  list(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${API_URL}/interviews`);
  }

  create(applicationId: number, payload: InterviewPayload): Observable<Interview> {
    return this.http.post<Interview>(
      `${API_URL}/applications/${applicationId}/interviews`,
      payload,
    );
  }

  updateStatus(id: number, status: InterviewStatus): Observable<Interview> {
    return this.http.patch<Interview>(`${API_URL}/interviews/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/interviews/${id}`);
  }
}