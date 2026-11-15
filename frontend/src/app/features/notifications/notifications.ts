import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { NotificationApi } from '../../core/services/notification-api';
import {
  NOTIFICATION_LABELS,
  Notification,
  NotificationType,
} from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  private api = inject(NotificationApi);

  items = signal<Notification[]>([]);
  loading = signal(true);
  error = signal('');

  unreadCount = computed(() => this.items().filter((n) => !n.read).length);

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
        this.api.refreshUnread();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your notifications. Try again.');
      },
    });
  }

  label(type: NotificationType): string {
    return NOTIFICATION_LABELS[type] ?? 'Notification';
  }

  markRead(notification: Notification): void {
    if (notification.read) return;
    this.error.set('');

    this.api.markAsRead(notification.id).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((n) => (n.id === updated.id ? updated : n)));
        this.api.refreshUnread();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Could not update this notification.'),
    });
  }

  markAllRead(): void {
    this.error.set('');

    this.api.markAllAsRead().subscribe({
      next: () => {
        this.items.update((list) => list.map((n) => ({ ...n, read: true })));
        this.api.refreshUnread();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Could not update your notifications.'),
    });
  }

  remove(notification: Notification): void {
    this.error.set('');

    this.api.delete(notification.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((n) => n.id !== notification.id));
        this.api.refreshUnread();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Could not delete this notification.'),
    });
  }
}