import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ApplicationApi } from '../../core/services/application-api';
import { Application, ApplicationStatus, STATUSES } from '../../core/models/application.model';

@Component({
  selector: 'app-applications',
  imports: [DatePipe, RouterLink],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {
  private api = inject(ApplicationApi);

  statuses = STATUSES;
  items = signal<Application[]>([]);
  filter = signal<ApplicationStatus | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.load();
  }

  setFilter(status: ApplicationStatus | null): void {
    this.filter.set(status);
    this.load();
  }

  color(status: ApplicationStatus): string {
    return STATUSES.find((s) => s.key === status)?.color ?? '#8b9bb0';
  }

  changeStatus(app: Application, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ApplicationStatus;
    this.error.set('');

    this.api.updateStatus(app.id, status).subscribe({
      next: (updated) => {
        const active = this.filter();
        this.items.update((list) =>
          active && updated.status !== active
            ? list.filter((a) => a.id !== updated.id)
            : list.map((a) => (a.id === updated.id ? updated : a)),
        );
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Could not update the status. Try again.');
        this.load();
      },
    });
  }
  remove(app: Application): void {
    if (!confirm(`Delete "${app.jobTitle}" at ${app.companyName}?`)) {
      return;
    }

    this.api.delete(app.id).subscribe({
      next: () => this.items.update((list) => list.filter((a) => a.id !== app.id)),
      error: (err) =>
        this.error.set(err.error?.message ?? 'Could not delete the application. Try again.'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list(this.filter()).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your applications. Try again.');
      },
    });
  }
}