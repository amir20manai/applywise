import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { Interview } from '../models/interview.model';

// Le candidat consulte ses entretiens. Le recruteur les gère (voir AdminApi).
@Injectable({ providedIn: 'root' })
export class InterviewApi {
  private http = inject(HttpClient);

  list(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${API_URL}/interviews`);
  }
}