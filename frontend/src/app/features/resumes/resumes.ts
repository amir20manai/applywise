import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ToastService } from '../../core/services/toast';
import { ConfirmService } from '../../core/services/confirm';
import { ResumeApi } from '../../core/services/resume-api';
import { Resume } from '../../core/models/resume.model';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['.pdf', '.doc', '.docx'];

@Component({
  selector: 'app-resumes',
  imports: [DatePipe],
  templateUrl: './resumes.html',
  styleUrl: './resumes.css',
})
export class Resumes implements OnInit {
  private api = inject(ResumeApi);
  private confirmDialog = inject(ConfirmService);
  private toast = inject(ToastService);

  items = signal<Resume[]>([]);
  loading = signal(true);
  uploading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.load();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permet de re-choisir le même fichier

    if (!file) return;

    const name = file.name.toLowerCase();
    if (!ALLOWED.some((ext) => name.endsWith(ext))) {
      this.toast.error('Only PDF, DOC and DOCX files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      this.toast.error('This file is larger than 5 MB.');
      return;
    }

    this.uploading.set(true);

    this.api.upload(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.toast.success(`${file.name} uploaded.`);
        this.load();
      },
      error: (err) => {
        this.uploading.set(false);
        this.toast.error(err.error?.message ?? 'Could not upload the file. Try again.');
      },
    });
  }

  download(resume: Resume): void {
    this.api.download(resume.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resume.fileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Could not download this CV. Try again.'),
    });
  }

  makeDefault(resume: Resume): void {
    this.api.setDefault(resume.id).subscribe({
      next: () => {
        this.toast.success(`${resume.fileName} is now your default CV.`);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Could not update the default CV.'),
    });
  }

  async remove(resume: Resume): Promise<void> {
    const confirmed = await this.confirmDialog.ask({
      title: 'Delete this CV?',
      message: `"${resume.fileName}" will be removed from your account. This cannot be undone.`,
      confirmLabel: 'Delete CV',
      danger: true,
    });
    if (!confirmed) return;

    this.api.delete(resume.id).subscribe({
      next: () => {
        this.toast.success('CV deleted.');
        this.load(); // le backend choisit un nouveau CV par défaut si besoin
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Could not delete this CV.'),
    });
  }

  formatSize(bytes: number | null): string {
    if (!bytes) return '';
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private load(): void {
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your CVs. Try again.');
      },
    });
  }
}