import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApplicationApi } from '../../../core/services/application-api';
import { ResumeApi } from '../../../core/services/resume-api';
import { ApplicationStatus, STATUSES } from '../../../core/models/application.model';
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
  private applications = inject(ApplicationApi);
  private resumeApi = inject(ResumeApi);

  statuses = STATUSES;
  resumes = signal<Resume[]>([]);
  saving = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    jobTitle: ['', Validators.required],
    companyName: ['', Validators.required],
    location: [''],
    status: ['PENDING' as ApplicationStatus],
    jobUrl: [''],
    resumeId: [null as number | null],
    notes: ['', Validators.maxLength(3000)],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.resumeApi.list().subscribe({
      next: (resumes) => {
        this.resumes.set(resumes);
        // Le CV par défaut est présélectionné
        const preferred = resumes.find((r) => r.defaultResume);
        if (preferred) {
          this.form.controls.resumeId.setValue(preferred.id);
        }
      },
      error: () => this.resumes.set([]),
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

    this.applications
      .create({
        jobTitle: v.jobTitle.trim(),
        companyName: v.companyName.trim(),
        location: v.location.trim() || undefined,
        jobUrl: v.jobUrl.trim() || undefined,
        notes: v.notes.trim() || undefined,
        status: v.status,
        resumeId: v.resumeId ?? undefined,
      })
      .subscribe({
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
}