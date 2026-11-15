import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { JobOfferApi } from '../../../core/services/job-offer-api';
import { CompanyApi } from '../../../core/services/company-api';
import { JobOffer } from '../../../core/models/job-offer.model';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-manage-offers',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './manage-offers.html',
  styleUrl: './manage-offers.css',
})
export class ManageOffers implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(JobOfferApi);
  private companyApi = inject(CompanyApi);

  items = signal<JobOffer[]>([]);
  companies = signal<Company[]>([]);
  editingId = signal<number | null>(null);
  showForm = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  notice = signal('');

  form = this.fb.nonNullable.group({
    companyId: [null as number | null, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    location: [''],
    employmentType: [''],
    experienceLevel: [''],
    salary: [''],
    deadline: [''],
    sourceUrl: [''],
    description: ['', Validators.maxLength(3000)],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.load();
    this.companyApi.list().subscribe({ next: (list) => this.companies.set(list) });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      companyId: null,
      title: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      salary: '',
      deadline: '',
      sourceUrl: '',
      description: '',
    });
    this.error.set('');
    this.notice.set('');
    this.showForm.set(true);
  }

  openEdit(offer: JobOffer): void {
    this.editingId.set(offer.id);
    this.form.reset({
      companyId: offer.companyId,
      title: offer.title,
      location: offer.location ?? '',
      employmentType: offer.employmentType ?? '',
      experienceLevel: offer.experienceLevel ?? '',
      salary: offer.salary ?? '',
      // "2026-12-31T23:59:00" -> "2026-12-31T23:59" pour datetime-local
      deadline: offer.deadline ? offer.deadline.slice(0, 16) : '',
      sourceUrl: offer.sourceUrl ?? '',
      description: offer.description ?? '',
    });
    this.error.set('');
    this.notice.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload = {
      title: v.title.trim(),
      companyId: v.companyId as number,
      location: v.location.trim() || undefined,
      employmentType: v.employmentType.trim() || undefined,
      experienceLevel: v.experienceLevel.trim() || undefined,
      salary: v.salary.trim() || undefined,
      // le backend attend les secondes: "2026-12-31T23:59:00"
      deadline: v.deadline ? `${v.deadline}:00` : undefined,
      sourceUrl: v.sourceUrl.trim() || undefined,
      description: v.description.trim() || undefined,
    };

    const id = this.editingId();
    this.saving.set(true);
    this.error.set('');

    const request = id === null ? this.api.create(payload) : this.api.update(id, payload);

    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        this.notice.set(`${saved.title} saved.`);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const details = err.error?.validationErrors;
        this.error.set(
          details
            ? Object.values(details).join(' ')
            : (err.error?.message ?? 'Could not save the offer. Try again.'),
        );
      },
    });
  }

  remove(offer: JobOffer): void {
    if (!confirm(`Delete "${offer.title}"?`)) return;

    this.error.set('');
    this.notice.set('');

    this.api.delete(offer.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((o) => o.id !== offer.id));
        this.notice.set(`${offer.title} deleted.`);
      },
      // Le backend refuse si des candidatures sont liées à cette offre (409)
      error: (err) => this.error.set(err.error?.message ?? 'Could not delete the offer.'),
    });
  }

  private load(): void {
    this.api.search('', '').subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load job offers. Try again.');
      },
    });
  }
}