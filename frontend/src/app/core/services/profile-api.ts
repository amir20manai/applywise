import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { ChangePasswordPayload, Profile, ProfilePayload } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private http = inject(HttpClient);

  get(): Observable<Profile> {
    return this.http.get<Profile>(`${API_URL}/profile`);
  }

  update(payload: ProfilePayload): Observable<Profile> {
    return this.http.put<Profile>(`${API_URL}/profile`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.put<void>(`${API_URL}/profile/password`, payload);
  }
}