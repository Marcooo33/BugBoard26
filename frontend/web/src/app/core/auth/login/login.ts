import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '../auth-store';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private route = inject(ActivatedRoute);
  private auth = inject(AuthStore);

  isValidEmail: boolean = true;
  isValidPassword: boolean = true;

  loginError = signal<string | null>(null);

  constructor() {
    this.loginForm.valueChanges.subscribe(() => {
      this.loginError.set(null);
    });
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit() {
    this.loginError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isValidEmail = this.loginForm.controls.email.valid;
      this.isValidPassword = this.loginForm.controls.password.valid;
      return;
    }

    this.isValidEmail = true;
    this.isValidPassword = true;

    this.auth.login(
      this.loginForm.controls.email.value!,
      this.loginForm.controls.password.value!,
      this.route.snapshot.queryParamMap.get('returnUrl') || '/'
    ).subscribe({
      error: () => this.loginError.set('Email o password errati. Riprova.')
    });
  }
}
