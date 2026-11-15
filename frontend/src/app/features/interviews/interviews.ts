import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InterviewApi } from '../../core/services/interview-api';
import { ApplicationApi } from '../../core/services/application-api';
import { AiApi } from '../../core/services/ai-api';
import { Application } from '../../core/models/application.model';
import { LetterLanguage } from '../../core/models/ai.model';
import {
  INTERVIEW_STATUSES,
  Interview,
  InterviewStatus,
} from '../../core/models/interview.model';

@Component({
  selector: 'app-interviews',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './interviews.html',
  styleUrl: './interviews.css',
})
export class Interviews implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(InterviewApi);
  private applicationsApi = inject(ApplicationApi);
  private ai = inject(AiApi);

  statuses = INTERVIEW_STATUSES;
  items = signal<Interview[]>([]);
  applications = signal<Application[]>([]);
  showForm = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  // Préparation d'entretien par l'IA
  prepLanguage = signal<LetterLanguage>('en');
  prepLoadingId = signal<number | null>(null);
  prepResults = signal<Record<number, string>>({});
  prepError = signal('');

  form = this.fb.nonNullable.group({
    applicationId: [null as number | null, Validators.required],
    title: ['', Validators.required],
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
    this.applicationsApi.list().subscribe({ next: (apps) => this.applications.set(apps) });
  }

  openForm(): void {
    this.form.reset({
      applicationId: null,
      title: '',
      scheduledAt: '',
      location: '',
      meetingLink: '',
      notes: '',
    });
    this.error.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');

    this.api
      .create(v.applicationId as number, {
        title: v.title.trim(),
        // datetime-local donne "2026-11-20T10:00", le backend attend les secondes
        scheduledAt: v.scheduledAt ? `${v.scheduledAt}:00` : undefined,
        location: v.location.trim() || undefined,
        meetingLink: v.meetingLink.trim() || undefined,
        notes: v.notes.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.load();
        },
        error: (err) => {
          this.saving.set(false);
          const details = err.error?.validationErrors;
          this.error.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not save the interview. Try again.'),
          );
        },
      });
  }

  color(status: InterviewStatus): string {
    return this.statuses.find((s) => s.key === status)?.color ?? '#8b9bb0';
  }

  changeStatus(interview: Interview, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as InterviewStatus;
    this.error.set('');

    this.api.updateStatus(interview.id, status).subscribe({
      next: (updated) =>
        this.items.update((list) => list.map((i) => (i.id === updated.id ? updated : i))),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Could not update the status. Try again.');
        this.load();
      },
    });
  }

  remove(interview: Interview): void {
    if (!confirm(`Delete "${interview.title}" at ${interview.companyName}?`)) return;

    this.api.delete(interview.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i.id !== interview.id));
        this.hidePrep(interview.id);
      },
      error: (err) => this.error.set(err.error?.message ?? 'Could not delete the interview.'),
    });
  }

  setPrepLanguage(event: Event): void {
    this.prepLanguage.set((event.target as HTMLSelectElement).value as LetterLanguage);
  }

  prepare(interview: Interview): void {
    this.prepError.set('');
    this.prepLoadingId.set(interview.id);

    this.ai.prepareInterview(interview.id, this.prepLanguage()).subscribe({
      next: (result) => {
        this.prepResults.update((map) => ({ ...map, [interview.id]: result.text }));
        this.prepLoadingId.set(null);
      },
      error: (err) => {
        this.prepLoadingId.set(null);
        this.prepError.set(
          err.error?.message ?? 'Could not prepare this interview. Try again.',
        );
      },
    });
  }

  hidePrep(id: number): void {
    this.prepResults.update((map) => {
      const next = { ...map };
      delete next[id];
      return next;
    });
  }

  private load(): void {
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your interviews. Try again.');
      },
    });
  }
}