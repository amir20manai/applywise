import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { Resume } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeApi {
  private http = inject(HttpClient);

  list(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${API_URL}/resumes`);
  }

  upload(file: File): Observable<Resume> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<Resume>(`${API_URL}/resumes`, body);
  }

  setDefault(id: number): Observable<Resume> {
    return this.http.put<Resume>(`${API_URL}/resumes/${id}/default`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/resumes/${id}`);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${API_URL}/resumes/${id}/download`, { responseType: 'blob' });
  }
}