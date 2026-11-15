import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { CoverLetterPayload, CoverLetterResult } from '../models/ai.model';

@Injectable({ providedIn: 'root' })
export class AiApi {
  private http = inject(HttpClient);

  coverLetter(payload: CoverLetterPayload): Observable<CoverLetterResult> {
    return this.http.post<CoverLetterResult>(`${API_URL}/ai/cover-letter`, payload);
  }
}