import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApi {
  private http = inject(HttpClient);

  // Nombre de notifications non lues (affiché dans la sidebar)
  readonly unread = signal(0);

  refreshUnread(): void {
    this.http.get<{ count: number }>(`${API_URL}/notifications/unread-count`).subscribe({
      next: (res) => this.unread.set(res.count),
      error: () => {},
    });
  }

  list(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${API_URL}/notifications`);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${API_URL}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${API_URL}/notifications/read-all`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/notifications/${id}`);
  }
}