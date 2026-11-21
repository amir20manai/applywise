import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ConfirmService } from '../../../core/services/confirm';
import { ApplicationApi } from '../../../core/services/application-api';
import { ResumeApi } from '../../../core/services/resume-api';
import { AiApi } from '../../../core/services/ai-api';
import { ApplicationStatus, STATUSES } from '../../../core/models/application.model';
import { LetterLanguage } from '../../../core/models/ai.model';
import { Resume } from '../../../core/models/resume.model';

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './application-form.html',
  styleUrl: './application-form.css',
})
export class ApplicationForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private applications = inject(ApplicationApi);
  private resumeApi = inject(ResumeApi);
  private ai = inject(AiApi);
    private confirmDialog = inject(ConfirmService);

  statuses = STATUSES;
  resumes = signal<Resume[]>([]);
  editingId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  generating = signal(false);
  aiError = signal('');

  form = this.fb.nonNullable.group({
    jobTitle: ['', Validators.required],
    companyName: ['', Validators.required],
    location: [''],
    status: ['PENDING' as ApplicationStatus],
    jobUrl: [''],
    resumeId: [null as number | null],
    notes: ['', Validators.maxLength(3000)],
    coverLetter: ['', Validators.maxLength(3000)],
    // Champs de l'assistant IA (jamais envoyés à l'enregistrement)
    aiHighlights: ['', Validators.maxLength(1500)],
    aiLanguage: ['en' as LetterLanguage],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(Number(id));
      this.loadApplication(Number(id));
    }

    this.resumeApi.list().subscribe({
      next: (resumes) => {
        this.resumes.set(resumes);
        // En création, le CV par défaut est présélectionné
        if (!id) {
          const preferred = resumes.find((r) => r.defaultResume);
          if (preferred) {
            this.form.controls.resumeId.setValue(preferred.id);
          }
        }
      },
      error: () => this.resumes.set([]),
    });
  }

  async generateLetter(): Promise<void> {
    this.aiError.set('');

    const v = this.form.getRawValue();
    const jobTitle = v.jobTitle.trim();
    const companyName = v.companyName.trim();

    if (!jobTitle || !companyName) {
      this.f.jobTitle.markAsTouched();
      this.f.companyName.markAsTouched();
      this.aiError.set('Fill in the job title and the company first.');
      return;
    }

    if (this.f.aiHighlights.invalid) {
      this.f.aiHighlights.markAsTouched();
      return;
    }

    if (v.coverLetter.trim()) {
      const replace = await this.confirmDialog.ask({
        title: 'Replace the cover letter?',
        message: 'The AI will write a new letter and replace the one you already wrote.',
        confirmLabel: 'Replace it',
      });
      if (!replace) return;
    }

    this.generating.set(true);

    this.ai
      .coverLetter({
        jobTitle,
        companyName,
        location: v.location.trim() || undefined,
        highlights: v.aiHighlights.trim() || undefined,
        language: v.aiLanguage,
      })
      .subscribe({
        next: (result) => {
          this.f.coverLetter.setValue(result.text.slice(0, 3000));
          this.f.coverLetter.markAsDirty();
          this.generating.set(false);
        },
        error: (err) => {
          this.generating.set(false);
          const details = err.error?.validationErrors;
          this.aiError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not write the letter. Try again.'),
          );
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.getRawValue();
    const payload = {
      jobTitle: v.jobTitle.trim(),
      companyName: v.companyName.trim(),
      location: v.location.trim() || undefined,
      jobUrl: v.jobUrl.trim() || undefined,
      notes: v.notes.trim() || undefined,
      coverLetter: v.coverLetter.trim() || undefined,
      status: v.status,
      resumeId: v.resumeId ?? undefined,
    };

    const id = this.editingId();
    const request =
      id === null ? this.applications.create(payload) : this.applications.update(id, payload);

    request.subscribe({
      next: () => this.router.navigate(['/applications']),
      error: (err) => {
        this.saving.set(false);
        const details = err.error?.validationErrors;
        this.errorMessage.set(
          details
            ? Object.values(details).join(' ')
            : (err.error?.message ?? 'Could not save the application. Try again.'),
        );
      },
    });
  }

  private loadApplication(id: number): void {
    this.loading.set(true);

    this.applications.get(id).subscribe({
      next: (app) => {
        this.form.reset({
          jobTitle: app.jobTitle,
          companyName: app.companyName,
          location: app.location ?? '',
          status: app.status,
          jobUrl: app.jobUrl ?? '',
          resumeId: app.resumeId,
          notes: app.notes ?? '',
          coverLetter: app.coverLetter ?? '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Could not load this application.');
      },
    });
  }
}