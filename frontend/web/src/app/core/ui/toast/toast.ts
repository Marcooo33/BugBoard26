import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
