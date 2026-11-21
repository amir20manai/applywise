import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '../../../core/services/toast';
import { ConfirmService } from '../../../core/services/confirm';
import { CompanyApi } from '../../../core/services/company-api';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-companies',
  imports: [ReactiveFormsModule],
  templateUrl: './companies.html',
  styleUrl: './companies.css',
})
export class Companies implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(CompanyApi);
  private confirmDialog = inject(ConfirmService);
  private toast = inject(ToastService);

  items = signal<Company[]>([]);
  editingId = signal<number | null>(null);
  showForm = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  notice = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', Validators.email],
    industry: [''],
    location: [''],
    website: [''],
    logo: [''],
    description: ['', Validators.maxLength(2000)],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set('');
    this.notice.set('');
    this.showForm.set(true);
  }

  openEdit(company: Company): void {
    this.editingId.set(company.id);
    this.form.reset({
      name: company.name,
      email: company.email ?? '',
      industry: company.industry ?? '',
      location: company.location ?? '',
      website: company.website ?? '',
      logo: company.logo ?? '',
      description: company.description ?? '',
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
      name: v.name.trim(),
      email: v.email.trim() || undefined,
      industry: v.industry.trim() || undefined,
      location: v.location.trim() || undefined,
      website: v.website.trim() || undefined,
      logo: v.logo.trim() || undefined,
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
        this.toast.success(`${saved.name} saved.`);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const details = err.error?.validationErrors;
        this.error.set(
          details
            ? Object.values(details).join(' ')
            : (err.error?.message ?? 'Could not save the company. Try again.'),
        );
      },
    });
  }

  async remove(company: Company): Promise<void> {
    const confirmed = await this.confirmDialog.ask({
      title: 'Delete this company?',
      message: `${company.name} will be removed. A company that still has job offers cannot be deleted.`,
      confirmLabel: 'Delete company',
      danger: true,
    });
    if (!confirmed) return;

    this.api.delete(company.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((c) => c.id !== company.id));
        this.toast.success(`${company.name} deleted.`);
      },
      // Le backend refuse si des offres sont liées à cette company (409)
      error: (err) => this.toast.error(err.error?.message ?? 'Could not delete the company.'),
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
        this.error.set(err.error?.message ?? 'Could not load companies. Try again.');
      },
    });
  }
}