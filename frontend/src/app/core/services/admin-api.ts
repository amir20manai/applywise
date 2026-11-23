import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { AdminApplication, AdminInterview, AdminStats } from '../models/admin.model';
import { ApplicationStatus } from '../models/application.model';
import { InterviewPayload, InterviewStatus } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API_URL}/admin/stats`);
  }

  // ---------- Candidatures reçues ----------

  applications(status?: ApplicationStatus | null): Observable<AdminApplication[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminApplication[]>(`${API_URL}/admin/applications`, { params });
  }

  updateApplicationStatus(id: number, status: ApplicationStatus): Observable<AdminApplication> {
    return this.http.patch<AdminApplication>(`${API_URL}/admin/applications/${id}/status`, {
      status,
    });
  }

  downloadResume(applicationId: number): Observable<Blob> {
    return this.http.get(`${API_URL}/admin/applications/${applicationId}/resume`, {
      responseType: 'blob',
    });
  }

  // ---------- Entretiens ----------

  interviews(): Observable<AdminInterview[]> {
    return this.http.get<AdminInterview[]>(`${API_URL}/admin/interviews`);
  }

  createInterview(applicationId: number, payload: InterviewPayload): Observable<AdminInterview> {
    return this.http.post<AdminInterview>(
      `${API_URL}/admin/applications/${applicationId}/interviews`,
      payload,
    );
  }

  updateInterview(id: number, payload: InterviewPayload): Observable<AdminInterview> {
    return this.http.put<AdminInterview>(`${API_URL}/admin/interviews/${id}`, payload);
  }

  updateInterviewStatus(id: number, status: InterviewStatus): Observable<AdminInterview> {
    return this.http.patch<AdminInterview>(`${API_URL}/admin/interviews/${id}/status`, { status });
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/interviews/${id}`);
  }
}