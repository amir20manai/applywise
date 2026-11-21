import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Rouge: pour une action qu'on ne peut pas annuler
  danger?: boolean;
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  // Retourne true si l'utilisateur confirme, false sinon
  ask(options: ConfirmOptions): Promise<boolean> {
    // Une seule boîte à la fois: on annule la précédente
    this.request()?.resolve(false);

    return new Promise<boolean>((resolve) => {
      this.request.set({
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        danger: false,
        ...options,
        resolve,
      });
    });
  }

  answer(value: boolean): void {
    const current = this.request();
    if (!current) return;

    this.request.set(null);
    current.resolve(value);
  }
}