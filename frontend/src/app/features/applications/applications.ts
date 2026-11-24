import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ApplicationApi } from '../../core/services/application-api';
import { ToastService } from '../../core/services/toast';
import { ConfirmService } from '../../core/services/confirm';
import { Application, ApplicationStatus, STATUSES } from '../../core/models/application.model';

const WITHDRAWABLE: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'INTERVIEW'];

const MESSAGES: Record<string, string> = {
  APPLIED: 'Sent. Waiting for the recruiter.',
  UNDER_REVIEW: 'The recruiter is reviewing it.',
  INTERVIEW: 'You are invited to an interview. See the Interviews page.',
  ACCEPTED: 'Accepted. Congratulations!',
  REJECTED: 'Not selected this time.',
  WITHDRAWN: 'You withdrew this application.',
};

@Component({
  selector: 'app-applications',
  imports: [DatePipe, RouterLink],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {
  private api = inject(ApplicationApi);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmService);

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
    this.loading.set(true);
    this.load();
  }

  color(status: ApplicationStatus): string {
    return STATUSES.find((s) => s.key === status)?.color ?? '#8b9bb0';
  }

  label(status: ApplicationStatus): string {
    return STATUSES.find((s) => s.key === status)?.label ?? status;
  }

  message(status: ApplicationStatus): string {
    return MESSAGES[status] ?? '';
  }

  canWithdraw(app: Application): boolean {
    return WITHDRAWABLE.includes(app.status);
  }

  async withdraw(app: Application): Promise<void> {
    const confirmed = await this.confirmDialog.ask({
      title: 'Withdraw this application?',
      message: `The recruiter at ${app.companyName} will see that you withdrew your application for "${app.jobTitle}". You cannot send it again.`,
      confirmLabel: 'Withdraw',
      danger: true,
    });
    if (!confirmed) return;

    this.api.withdraw(app.id).subscribe({
      next: (updated) => {
        const active = this.filter();
        this.items.update((list) =>
          active && updated.status !== active
            ? list.filter((a) => a.id !== updated.id)
            : list.map((a) => (a.id === updated.id ? updated : a)),
        );
        this.toast.success('Application withdrawn.');
      },
      error: (err) =>
        this.toast.error(err.error?.message ?? 'Could not withdraw the application. Try again.'),
    });
  }

  private load(): void {
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