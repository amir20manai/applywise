import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { Company, CompanyPayload } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyApi {
  private http = inject(HttpClient);

  list(): Observable<Company[]> {
    return this.http.get<Company[]>(`${API_URL}/companies`);
  }

  create(payload: CompanyPayload): Observable<Company> {
    return this.http.post<Company>(`${API_URL}/companies`, payload);
  }

  update(id: number, payload: CompanyPayload): Observable<Company> {
    return this.http.put<Company>(`${API_URL}/companies/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/companies/${id}`);
  }
}