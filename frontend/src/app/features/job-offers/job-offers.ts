import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { JobOfferApi } from '../../core/services/job-offer-api';
import { ApplicationApi } from '../../core/services/application-api';
import { ResumeApi } from '../../core/services/resume-api';
import { JobOffer } from '../../core/models/job-offer.model';

@Component({
  selector: 'app-job-offers',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './job-offers.html',
  styleUrl: './job-offers.css',
})
export class JobOffers implements OnInit {
  private fb = inject(FormBuilder);
  private offersApi = inject(JobOfferApi);
  private applicationsApi = inject(ApplicationApi);
  private resumeApi = inject(ResumeApi);

  items = signal<JobOffer[]>([]);
  appliedIds = signal<Set<number>>(new Set());
  defaultResumeId = signal<number | null>(null);
  expandedId = signal<number | null>(null);
  applyingId = signal<number | null>(null);
  loading = signal(true);
  error = signal('');
  notice = signal('');

  search = this.fb.nonNullable.group({
    title: [''],
    location: [''],
  });

  ngOnInit(): void {
    this.load();

    // Offres déjà postulées (pour afficher "Applied")
    this.applicationsApi.list().subscribe({
      next: (apps) =>
        this.appliedIds.set(
          new Set(apps.filter((a) => a.jobOfferId !== null).map((a) => a.jobOfferId as number)),
        ),
    });

    // CV par défaut utilisé pour postuler
    this.resumeApi.list().subscribe({
      next: (resumes) =>
        this.defaultResumeId.set(resumes.find((r) => r.defaultResume)?.id ?? null),
    });
  }

  submitSearch(): void {
    this.load();
  }

  clearSearch(): void {
    this.search.reset();
    this.load();
  }

  toggle(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  apply(offer: JobOffer): void {
    this.error.set('');
    this.notice.set('');
    this.applyingId.set(offer.id);

    this.applicationsApi.applyToOffer(offer.id, this.defaultResumeId()).subscribe({
      next: () => {
        this.applyingId.set(null);
        this.appliedIds.update((ids) => new Set(ids).add(offer.id));
        this.notice.set(`Application saved for ${offer.title}.`);
      },
      error: (err) => {
        this.applyingId.set(null);
        this.error.set(err.error?.message ?? 'Could not apply to this offer. Try again.');
      },
    });
  }

  private load(): void {
    const { title, location } = this.search.getRawValue();
    const t = title.trim();
    const l = location.trim();

    this.loading.set(true);
    this.error.set('');

    // Le backend filtre par titre OU par lieu: si les deux sont remplis,
    // on cherche par titre puis on filtre le lieu ici.
    this.offersApi.search(t, t ? '' : l).subscribe({
      next: (offers) => {
        const active = offers.filter((o) => o.status === 'ACTIVE');
        this.items.set(
          t && l
            ? active.filter((o) => o.location?.toLowerCase().includes(l.toLowerCase()))
            : active,
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load job offers. Try again.');
      },
    });
  }
}