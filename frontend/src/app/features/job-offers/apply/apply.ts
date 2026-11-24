import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { JobOfferApi } from '../../../core/services/job-offer-api';
import { ApplicationApi } from '../../../core/services/application-api';
import { ResumeApi } from '../../../core/services/resume-api';
import { ProfileApi } from '../../../core/services/profile-api';
import { AiApi } from '../../../core/services/ai-api';
import { ToastService } from '../../../core/services/toast';
import { ConfirmService } from '../../../core/services/confirm';
import { JobOffer } from '../../../core/models/job-offer.model';
import { Resume } from '../../../core/models/resume.model';
import { LetterLanguage } from '../../../core/models/ai.model';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['.pdf', '.doc', '.docx'];

@Component({
  selector: 'app-apply',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './apply.html',
  styleUrl: './apply.css',
})
export class Apply implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offersApi = inject(JobOfferApi);
  private applicationsApi = inject(ApplicationApi);
  private resumeApi = inject(ResumeApi);
  private profileApi = inject(ProfileApi);
  private ai = inject(AiApi);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmService);

  offer = signal<JobOffer | null>(null);
  resumes = signal<Resume[]>([]);
  loading = signal(true);
  loadError = signal('');

  submitting = signal(false);
  submitError = signal('');

  uploading = signal(false);
  uploadError = signal('');

  generating = signal(false);
  aiError = signal('');

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    resumeId: [null as number | null, Validators.required],
    coverLetter: ['', Validators.maxLength(3000)],
    // Champs de l'assistant IA (jamais envoyés avec la candidature)
    aiHighlights: ['', Validators.maxLength(1500)],
    aiLanguage: ['en' as LetterLanguage],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      offer: this.offersApi.get(id),
      resumes: this.resumeApi.list(),
      profile: this.profileApi.get(),
    }).subscribe({
      next: ({ offer, resumes, profile }) => {
        this.offer.set(offer);
        this.resumes.set(resumes);

        // On préremplit avec les infos du compte (le candidat peut les modifier)
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone ?? '',
          resumeId: resumes.find((r) => r.defaultResume)?.id ?? resumes[0]?.id ?? null,
        });

        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err.error?.message ?? 'Could not load this offer. Try again.');
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permet de re-choisir le même fichier

    if (!file) return;

    const name = file.name.toLowerCase();
    if (!ALLOWED.some((ext) => name.endsWith(ext))) {
      this.uploadError.set('Only PDF, DOC and DOCX files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      this.uploadError.set('This file is larger than 5 MB.');
      return;
    }

    this.uploadError.set('');
    this.uploading.set(true);

    this.resumeApi.upload(file).subscribe({
      next: (resume) => {
        this.uploading.set(false);
        this.resumes.update((list) => [...list, resume]);
        this.f.resumeId.setValue(resume.id);
        this.toast.success(`${resume.fileName} uploaded.`);
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err.error?.message ?? 'Could not upload the file. Try again.');
      },
    });
  }

  async generateLetter(): Promise<void> {
    this.aiError.set('');

    const offer = this.offer();
    if (!offer) return;

    if (this.f.aiHighlights.invalid) {
      this.f.aiHighlights.markAsTouched();
      return;
    }

    const v = this.form.getRawValue();

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
        jobTitle: offer.title,
        companyName: offer.companyName ?? 'the company',
        location: offer.location ?? undefined,
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
          this.aiError.set(err.error?.message ?? 'Could not write the letter. Try again.');
        },
      });
  }

  submit(): void {
    const offer = this.offer();
    if (!offer) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.submitError.set('');

    this.applicationsApi
      .apply({
        jobOfferId: offer.id,
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        resumeId: v.resumeId as number,
        coverLetter: v.coverLetter.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.success(
            `Application sent to ${offer.companyName ?? 'the recruiter'}. You will be notified of the answer.`,
          );
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          this.submitting.set(false);
          const details = err.error?.validationErrors;
          this.submitError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not send your application. Try again.'),
          );
        },
      });
  }
}