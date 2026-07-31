import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());

  private nextId = 0;

  show(message: string, type: ToastType = 'info', durationMs = 5000) {
    const id = this.nextId++;
    this._toasts.update(current => [...current, { id, message, type }]);

    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string, durationMs = 5000) {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 5000) {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 5000) {
    this.show(message, 'info', durationMs);
  }

  dismiss(id: number) {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }
}
