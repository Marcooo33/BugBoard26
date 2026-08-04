import { Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore } from '../../../core/auth/auth-store';
import { AuthApi } from '../../../core/auth/auth-api';
import { ToastService } from '../../../core/ui/toast/toast.service';
import { DemoDataService } from '../../../core/demo/demo-data.service';

export type DrawerMode = 'email' | 'password' | null;

@Component({
  selector: 'app-profile-view',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.css',
})
export class ProfileView {
  protected readonly authStore = inject(AuthStore);
  private readonly authApi = inject(AuthApi);
  private readonly toast = inject(ToastService);
  private readonly demoData = inject(DemoDataService);

  protected readonly isDemo = computed(() => this.demoData.isActive());

  // ─── Drawer State ─────────────────────────────────────────────────────────
  drawerMode = signal<DrawerMode>(null);
  isDrawerOpen = computed(() => this.drawerMode() !== null);

  // ─── Loading / Error ───────────────────────────────────────────────────────
  isLoading = signal(false);
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  currentPasswordError = signal<string | null>(null);

  // ─── Email Form ────────────────────────────────────────────────────────────
  emailForm = new FormGroup({
    newEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  // ─── Password Form ─────────────────────────────────────────────────────────
  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required, Validators.minLength(4)]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  // ─── Drawer Controls ───────────────────────────────────────────────────────
  openDrawer(mode: DrawerMode) {
    this.drawerMode.set(mode);
    this.emailForm.reset();
    this.passwordForm.reset();
    this.clearErrors();
  }

  closeDrawer() {
    this.drawerMode.set(null);
    this.clearErrors();
  }

  private clearErrors() {
    this.emailError.set(null);
    this.passwordError.set(null);
    this.currentPasswordError.set(null);
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout() {
    this.authStore.logout();
  }

  // ─── Role Badge Helper ──────────────────────────────────────────────────────
  getRoleBadgeClass(): string {
    const role = this.authStore.role();
    if (role === 'ADMIN') return 'role-badge role-badge--admin';
    if (role === 'DEVELOPER') return 'role-badge role-badge--developer';
    return 'role-badge role-badge--viewer';
  }

  // ─── Submit Email ──────────────────────────────────────────────────────────
  submitEmail() {
    if (this.isDemo() || this.emailForm.invalid) return;
    const uuid = this.authStore.uuid();
    const newEmail = this.emailForm.controls.newEmail.value!;
    if (!uuid) return;

    this.isLoading.set(true);
    this.clearErrors();

    this.authApi.updateEmail(uuid, newEmail).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeDrawer();

        // Notify the user, then clear the session
        this.toast.success(
          'Email aggiornata con successo. Per motivi di sicurezza, la sessione è stata terminata. Effettua nuovamente l\'accesso.',
          4000
        );

        // Delay logout slightly so the user reads the toast
        setTimeout(() => this.authStore.logout(), 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 400) {
          this.emailError.set('La nuova email è uguale a quella attuale.');
        } else if (err.status === 409) {
          this.emailError.set('Questa email è già in uso da un altro account.');
        } else {
          this.emailError.set('Errore imprevisto. Riprova più tardi.');
        }
      }
    });
  }

  // ─── Submit Password ───────────────────────────────────────────────────────
  submitPassword() {
    if (this.isDemo() || this.passwordForm.invalid) return;
    const uuid = this.authStore.uuid();
    const currentPassword = this.passwordForm.controls.currentPassword.value!;
    const newPassword = this.passwordForm.controls.newPassword.value!;
    if (!uuid) return;

    this.isLoading.set(true);
    this.clearErrors();

    this.authApi.updatePassword(uuid, currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeDrawer();

        // Notify the user, then clear the session
        this.toast.success(
          'Password aggiornata con successo. Effettua nuovamente l\'accesso con le nuove credenziali.',
          4000
        );

        // Delay logout slightly so the user reads the toast
        setTimeout(() => this.authStore.logout(), 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.currentPasswordError.set('La password attuale non è corretta.');
        } else if (err.status === 400) {
          this.passwordError.set('La nuova password deve essere diversa da quella attuale.');
        } else {
          this.passwordError.set('Errore imprevisto. Riprova più tardi.');
        }
      }
    });
  }
}
