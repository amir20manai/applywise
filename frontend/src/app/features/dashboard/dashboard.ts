import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../core/services/auth';
import { DashboardApi } from '../../core/services/dashboard-api';
import { DashboardStats } from '../../core/models/dashboard.model';

const STATUSES = [
  { key: 'PENDING', label: 'Pending', color: '#8b9bb0' },
  { key: 'APPLIED', label: 'Applied', color: '#2457f5' },
  { key: 'UNDER_REVIEW', label: 'Under review', color: '#8a63d2' },
  { key: 'INTERVIEW', label: 'Interview', color: '#e0a21b' },
  { key: 'ACCEPTED', label: 'Accepted', color: '#1f9d6b' },
  { key: 'REJECTED', label: 'Rejected', color: '#d64545' },
  { key: 'WITHDRAWN', label: 'Withdrawn', color: '#b8c2cd' },
];

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  auth = inject(AuthService);
  private api = inject(DashboardApi);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

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
  }
}