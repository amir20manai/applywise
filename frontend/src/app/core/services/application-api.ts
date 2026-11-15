import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { Application, ApplicationPayload, ApplicationStatus } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationApi {
  private http = inject(HttpClient);

  list(status?: ApplicationStatus | null): Observable<Application[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Application[]>(`${API_URL}/applications`, { params });
  }

  get(id: number): Observable<Application> {
    return this.http.get<Application>(`${API_URL}/applications/${id}`);
  }

  create(payload: ApplicationPayload): Observable<Application> {
    return this.http.post<Application>(`${API_URL}/applications`, payload);
  }

  update(id: number, payload: ApplicationPayload): Observable<Application> {
    return this.http.put<Application>(`${API_URL}/applications/${id}`, payload);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(`${API_URL}/applications/${id}/status`, { status });
  }

  applyToOffer(jobOfferId: number, resumeId: number | null): Observable<Application> {
    return this.http.post<Application>(`${API_URL}/applications`, {
      jobOfferId,
      status: 'APPLIED',
      ...(resumeId ? { resumeId } : {}),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/applications/${id}`);
  }
}