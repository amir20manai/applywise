import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminApi } from '../../../core/services/admin-api';
import { ToastService } from '../../../core/services/toast';
import { AdminApplication } from '../../../core/models/admin.model';
import { ApplicationStatus, STATUSES } from '../../../core/models/application.model';

type PanelMode = 'details' | 'interview';

@Component({
  selector: 'app-received-applications',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './received-applications.html',
  styleUrl: './received-applications.css',
})
export class ReceivedApplications implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(AdminApi);
  private toast = inject(ToastService);

  statuses = STATUSES;
  // Le recruteur ne peut pas mettre "Withdrawn": seul le candidat retire sa candidature
  decisionStatuses = STATUSES.filter((s) => s.key !== 'WITHDRAWN');

  statusLabel(status: ApplicationStatus): string {
    return STATUSES.find((s) => s.key === status)?.label ?? status;
  }
  items = signal<AdminApplication[]>([]);
  filter = signal<ApplicationStatus | null>(null);
  loading = signal(true);
  error = signal('');

  // Ligne ouverte (détails ou formulaire d'entretien)
  openId = signal<number | null>(null);
  mode = signal<PanelMode>('details');
  saving = signal(false);
  formError = signal('');

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    scheduledAt: [''],
    location: [''],
    meetingLink: [''],
    notes: ['', Validators.maxLength(2000)],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.load();
  }

  setFilter(status: ApplicationStatus | null): void {
    this.filter.set(status);
    this.openId.set(null);
    this.loading.set(true);
    this.load();
  }

  color(status: ApplicationStatus): string {
    return STATUSES.find((s) => s.key === status)?.color ?? '#8b9bb0';
  }

  toggle(app: AdminApplication, mode: PanelMode): void {
    if (this.openId() === app.id && this.mode() === mode) {
      this.openId.set(null);
      return;
    }

    this.openId.set(app.id);
    this.mode.set(mode);
    this.formError.set('');

    if (mode === 'interview') {
      this.form.reset({ title: '', scheduledAt: '', location: '', meetingLink: '', notes: '' });
    }
  }

  changeStatus(app: AdminApplication, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ApplicationStatus;

    this.api.updateApplicationStatus(app.id, status).subscribe({
      next: (updated) => {
        const active = this.filter();
        this.items.update((list) =>
          active && updated.status !== active
            ? list.filter((a) => a.id !== updated.id)
            : list.map((a) => (a.id === updated.id ? updated : a)),
        );
        this.toast.success(`Status updated. ${app.candidateName} was notified.`);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Could not update the status. Try again.');
        this.load();
      },
    });
  }

  downloadResume(app: AdminApplication): void {
    this.api.downloadResume(app.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = app.resumeFileName ?? 'cv';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err) =>
        this.toast.error(err.error?.message ?? 'Could not download this CV. Try again.'),
    });
  }

  scheduleInterview(app: AdminApplication): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set('');

    this.api
      .createInterview(app.id, {
        title: v.title.trim(),
        // datetime-local donne "2026-12-01T10:00", le backend attend les secondes
        scheduledAt: v.scheduledAt ? `${v.scheduledAt}:00` : undefined,
        location: v.location.trim() || undefined,
        meetingLink: v.meetingLink.trim() || undefined,
        notes: v.notes.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.openId.set(null);
          this.toast.success(`Interview scheduled. ${app.candidateName} was notified.`, {
            label: 'View interviews',
            link: '/admin/interviews',
          });
          this.load();
        },
        error: (err) => {
          this.saving.set(false);
          const details = err.error?.validationErrors;
          this.formError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not schedule the interview. Try again.'),
          );
        },
      });
  }

  private load(): void {
    this.api.applications(this.filter()).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load the applications. Try again.');
      },
    });
  }
}