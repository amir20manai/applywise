import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface ToastAction {
  label: string;
  link: string;
}

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  action?: ToastAction;
}

const MAX_VISIBLE = 4;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(message: string, action?: ToastAction): void {
    this.show({ kind: 'success', message, action }, 5000);
  }

  // Les erreurs restent plus longtemps: l'utilisateur doit avoir le temps de les lire
  error(message: string): void {
    this.show({ kind: 'error', message }, 9000);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(toast: Omit<Toast, 'id'>, duration: number): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { ...toast, id }].slice(-MAX_VISIBLE));
    setTimeout(() => this.dismiss(id), duration);
  }
}