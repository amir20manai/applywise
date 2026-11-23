import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminApi } from '../../../core/services/admin-api';
import { ToastService } from '../../../core/services/toast';
import { ConfirmService } from '../../../core/services/confirm';
import { AdminInterview } from '../../../core/models/admin.model';
import { INTERVIEW_STATUSES, InterviewStatus } from '../../../core/models/interview.model';

@Component({
  selector: 'app-manage-interviews',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-interviews.html',
  styleUrl: './manage-interviews.css',
})
export class ManageInterviews implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(AdminApi);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmService);

  statuses = INTERVIEW_STATUSES;
  items = signal<AdminInterview[]>([]);
  editingId = signal<number | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
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

  color(status: InterviewStatus): string {
    return this.statuses.find((s) => s.key === status)?.color ?? '#8b9bb0';
  }

  openEdit(interview: AdminInterview): void {
    this.editingId.set(interview.id);
    this.formError.set('');
    this.form.reset({
      title: interview.title,
      // "2026-12-01T10:00:00" -> "2026-12-01T10:00" pour datetime-local
      scheduledAt: interview.scheduledAt ? interview.scheduledAt.slice(0, 16) : '',
      location: interview.location ?? '',
      meetingLink: interview.meetingLink ?? '',
      notes: interview.notes ?? '',
    });
  }

  closeForm(): void {
    this.editingId.set(null);
  }

  submit(): void {
    const id = this.editingId();
    if (id === null) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set('');

    this.api
      .updateInterview(id, {
        title: v.title.trim(),
        scheduledAt: v.scheduledAt ? `${v.scheduledAt}:00` : undefined,
        location: v.location.trim() || undefined,
        meetingLink: v.meetingLink.trim() || undefined,
        notes: v.notes.trim() || undefined,
      })
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.editingId.set(null);
          this.toast.success(`Interview updated. ${saved.candidateName} was notified.`);
          this.load();
        },
        error: (err) => {
          this.saving.set(false);
          const details = err.error?.validationErrors;
          this.formError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not save the interview. Try again.'),
          );
        },
      });
  }

  changeStatus(interview: AdminInterview, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as InterviewStatus;

    this.api.updateInterviewStatus(interview.id, status).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
        this.toast.success(`Status updated. ${interview.candidateName} was notified.`);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Could not update the status. Try again.');
        this.load();
      },
    });
  }

  async remove(interview: AdminInterview): Promise<void> {
    const confirmed = await this.confirmDialog.ask({
      title: 'Delete this interview?',
      message: `"${interview.title}" with ${interview.candidateName} will be removed, and the candidate is told it was cancelled.`,
      confirmLabel: 'Delete interview',
      danger: true,
    });
    if (!confirmed) return;

    this.api.deleteInterview(interview.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i.id !== interview.id));
        if (this.editingId() === interview.id) {
          this.editingId.set(null);
        }
        this.toast.success('Interview deleted.');
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Could not delete the interview.'),
    });
  }

  private load(): void {
    this.api.interviews().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load the interviews. Try again.');
      },
    });
  }
}