import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { JobOffer, JobOfferPayload } from '../models/job-offer.model';

@Injectable({ providedIn: 'root' })
export class JobOfferApi {
  private http = inject(HttpClient);

  search(title: string, location: string): Observable<JobOffer[]> {
    let params = new HttpParams();
    if (title) params = params.set('title', title);
    if (location) params = params.set('location', location);
    return this.http.get<JobOffer[]>(`${API_URL}/job-offers`, { params });
  }

  get(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${API_URL}/job-offers/${id}`);
  }

  create(payload: JobOfferPayload): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${API_URL}/job-offers`, payload);
  }

  update(id: number, payload: JobOfferPayload): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${API_URL}/job-offers/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/job-offers/${id}`);
  }
}