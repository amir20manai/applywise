import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { DashboardApi } from '../../core/services/dashboard-api';
import { InterviewApi } from '../../core/services/interview-api';
import { ApplicationApi } from '../../core/services/application-api';
import { DashboardStats } from '../../core/models/dashboard.model';
import { Interview } from '../../core/models/interview.model';
import { Application, STATUSES } from '../../core/models/application.model';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  auth = inject(AuthService);
  private api = inject(DashboardApi);
  private interviewApi = inject(InterviewApi);
  private applicationApi = inject(ApplicationApi);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  interviews = signal<Interview[]>([]);
  interviewsLoading = signal(true);
  interviewsError = signal('');

  applications = signal<Application[]>([]);
  applicationsLoading = signal(true);
  applicationsError = signal('');

  // Une ligne par status, avec son compteur et son pourcentage
  rows = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalApplications;

    return STATUSES.map((status) => {
      const count = s.applicationsByStatus[status.key] ?? 0;
      return { ...status, count, percent: total ? (count / total) * 100 : 0 };
    });
  });

  // Seulement les status qui ont au moins une candidature (pour la barre)
  segments = computed(() => this.rows().filter((r) => r.count > 0));

  // Les 5 prochains entretiens (le backend les renvoie triés par date)
  upcoming = computed(() => {
    const now = Date.now();
    return this.interviews()
      .filter(
        (i) =>
          i.scheduledAt !== null &&
          new Date(i.scheduledAt).getTime() > now &&
          (i.status === 'SCHEDULED' || i.status === 'RESCHEDULED'),
      )
      .slice(0, 5);
  });

  // Les 5 candidatures les plus récentes (le backend les renvoie triées)
  recent = computed(() => this.applications().slice(0, 5));

  ngOnInit(): void {
    this.api.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your dashboard. Try again.');
      },
    });

    this.interviewApi.list().subscribe({
      next: (items) => {
        this.interviews.set(items);
        this.interviewsLoading.set(false);
      },
      error: () => {
        this.interviewsLoading.set(false);
        this.interviewsError.set('Could not load your interviews.');
      },
    });

    this.applicationApi.list().subscribe({
      next: (items) => {
        this.applications.set(items);
        this.applicationsLoading.set(false);
      },
      error: () => {
        this.applicationsLoading.set(false);
        this.applicationsError.set('Could not load your applications.');
      },
    });
  }

  statusColor(key: string): string {
    return STATUSES.find((s) => s.key === key)?.color ?? '#8b9bb0';
  }

  statusLabel(key: string): string {
    return STATUSES.find((s) => s.key === key)?.label ?? key;
  }
}