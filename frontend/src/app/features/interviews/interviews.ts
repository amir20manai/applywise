import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { InterviewApi } from '../../core/services/interview-api';
import { AiApi } from '../../core/services/ai-api';
import { LetterLanguage } from '../../core/models/ai.model';
import {
  INTERVIEW_STATUSES,
  Interview,
  InterviewStatus,
} from '../../core/models/interview.model';

@Component({
  selector: 'app-interviews',
  imports: [DatePipe, RouterLink],
  templateUrl: './interviews.html',
  styleUrl: './interviews.css',
})
export class Interviews implements OnInit {
  private api = inject(InterviewApi);
  private ai = inject(AiApi);

  items = signal<Interview[]>([]);
  loading = signal(true);
  error = signal('');

  // Préparation d'entretien par l'IA
  prepLanguage = signal<LetterLanguage>('en');
  prepLoadingId = signal<number | null>(null);
  prepResults = signal<Record<number, string>>({});
  prepError = signal('');

  ngOnInit(): void {
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

  color(status: InterviewStatus): string {
    return INTERVIEW_STATUSES.find((s) => s.key === status)?.color ?? '#8b9bb0';
  }

  label(status: InterviewStatus): string {
    return INTERVIEW_STATUSES.find((s) => s.key === status)?.label ?? status;
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
        this.prepError.set(err.error?.message ?? 'Could not prepare this interview. Try again.');
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
}