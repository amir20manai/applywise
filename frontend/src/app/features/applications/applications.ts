import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmService } from '../../core/services/confirm';

import { ToastService } from '../../core/services/toast';
import { ApplicationApi } from '../../core/services/application-api';
import { AiApi } from '../../core/services/ai-api';
import { Application, ApplicationStatus, STATUSES } from '../../core/models/application.model';
import { FollowUpPurpose, LetterLanguage } from '../../core/models/ai.model';

@Component({
  selector: 'app-applications',
  imports: [DatePipe, RouterLink],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {
  private api = inject(ApplicationApi);
  private ai = inject(AiApi);
  private confirmDialog = inject(ConfirmService);
  private toast = inject(ToastService);

  statuses = STATUSES;
  items = signal<Application[]>([]);
  filter = signal<ApplicationStatus | null>(null);
  loading = signal(true);
  error = signal('');

  // Assistant email (relance / remerciement)
  mailFor = signal<number | null>(null);
  mailPurpose = signal<FollowUpPurpose>('follow_up');
  mailLanguage = signal<LetterLanguage>('en');
  mailDetails = signal('');
  mailText = signal('');
  mailLoading = signal(false);
  mailError = signal('');
  copied = signal(false);

  // Lien "mailto:" avec le sujet et le texte du mail généré
  mailto = computed(() => {
    const text = this.mailText().trim();
    if (!text) return '';

    const match = text.match(/^Subject:[ \t]*(.*)(?:\r?\n|$)/i);
    const subject = match ? match[1].trim() : '';
    const body = match ? text.slice(match[0].length).trim() : text;

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

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
        this.toast.error(err.error?.message ?? 'Could not update the status. Try again.');
        this.load();
      },
    });
  }

  async remove(app: Application): Promise<void> {
    const confirmed = await this.confirmDialog.ask({
      title: 'Delete this application?',
      message: `"${app.jobTitle}" at ${app.companyName} will be removed from your list. This cannot be undone.`,
      confirmLabel: 'Delete application',
      danger: true,
    });
    if (!confirmed) return;

    this.api.delete(app.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((a) => a.id !== app.id));
        if (this.mailFor() === app.id) {
          this.mailFor.set(null);
        }
        this.toast.success('Application deleted.');
      },
      error: (err) =>
        this.toast.error(err.error?.message ?? 'Could not delete the application. Try again.'),
    });
  }

  // ---------- Assistant email ----------

  toggleMail(app: Application): void {
    if (this.mailFor() === app.id) {
      this.mailFor.set(null);
      return;
    }

    this.mailFor.set(app.id);
    // Après un entretien on propose un remerciement, sinon une relance
    this.mailPurpose.set(app.status === 'INTERVIEW' ? 'thank_you' : 'follow_up');
    this.mailDetails.set('');
    this.mailText.set('');
    this.mailError.set('');
    this.copied.set(false);
  }

  setMailPurpose(event: Event): void {
    this.mailPurpose.set((event.target as HTMLSelectElement).value as FollowUpPurpose);
  }

  setMailLanguage(event: Event): void {
    this.mailLanguage.set((event.target as HTMLSelectElement).value as LetterLanguage);
  }

  setMailDetails(event: Event): void {
    this.mailDetails.set((event.target as HTMLTextAreaElement).value);
  }

  setMailText(event: Event): void {
    this.mailText.set((event.target as HTMLTextAreaElement).value);
  }

  generateMail(app: Application): void {
    this.mailError.set('');
    this.copied.set(false);
    this.mailLoading.set(true);

    this.ai
      .followUp(app.id, {
        purpose: this.mailPurpose(),
        language: this.mailLanguage(),
        details: this.mailDetails().trim() || undefined,
      })
      .subscribe({
        next: (result) => {
          this.mailText.set(result.text);
          this.mailLoading.set(false);
        },
        error: (err) => {
          this.mailLoading.set(false);
          const details = err.error?.validationErrors;
          this.mailError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not write the email. Try again.'),
          );
        },
      });
  }

  async copyMail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.mailText());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.mailError.set('Could not copy. Select the text and copy it yourself.');
    }
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