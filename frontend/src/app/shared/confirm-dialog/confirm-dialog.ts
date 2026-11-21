import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';

import { ConfirmService } from '../../core/services/confirm';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  protected confirm = inject(ConfirmService);
  private dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Ouvre et ferme la boîte native <dialog> selon la demande en cours
    effect(() => {
      const element = this.dialog()?.nativeElement;
      const open = this.confirm.request() !== null;

      if (!element) return;
      if (open && !element.open) element.showModal();
      if (!open && element.open) element.close();
    });
  }

  // Touche Échap
  onCancel(event: Event): void {
    event.preventDefault();
    this.confirm.answer(false);
  }

  // Clic sur le fond sombre
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.confirm.answer(false);
    }
  }
}