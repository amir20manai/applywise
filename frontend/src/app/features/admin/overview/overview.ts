import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminApi } from '../../../core/services/admin-api';
import { AdminStats } from '../../../core/models/admin.model';
import { STATUSES } from '../../../core/models/application.model';

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  private api = inject(AdminApi);

  stats = signal<AdminStats | null>(null);
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
    this.api.stats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load the overview. Try again.');
      },
    });
  }
}