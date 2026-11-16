import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import {
  AiText,
  CoverLetterPayload,
  CoverLetterResult,
  FollowUpPayload,
  FollowUpResult,
  InterviewPrepResult,
  LetterLanguage,
  OfferDescriptionPayload,
} from '../models/ai.model';

@Injectable({ providedIn: 'root' })
export class AiApi {
  private http = inject(HttpClient);

  coverLetter(payload: CoverLetterPayload): Observable<CoverLetterResult> {
    return this.http.post<CoverLetterResult>(`${API_URL}/ai/cover-letter`, payload);
  }

  prepareInterview(interviewId: number, language: LetterLanguage): Observable<InterviewPrepResult> {
    return this.http.post<InterviewPrepResult>(
      `${API_URL}/ai/interviews/${interviewId}/prepare`,
      {},
      { params: { language } },
    );
  }

  followUp(applicationId: number, payload: FollowUpPayload): Observable<FollowUpResult> {
    return this.http.post<FollowUpResult>(
      `${API_URL}/ai/applications/${applicationId}/follow-up`,
      payload,
    );
  }

  summarizeOffer(offerId: number, language: LetterLanguage): Observable<AiText> {
    return this.http.post<AiText>(
      `${API_URL}/ai/job-offers/${offerId}/summary`,
      {},
      { params: { language } },
    );
  }

  offerDescription(payload: OfferDescriptionPayload): Observable<AiText> {
    return this.http.post<AiText>(`${API_URL}/ai/offer-description`, payload);
  }
}