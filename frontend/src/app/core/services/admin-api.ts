import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { AdminStats } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API_URL}/admin/stats`);
  }
}