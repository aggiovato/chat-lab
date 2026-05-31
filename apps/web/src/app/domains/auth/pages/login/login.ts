import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../store/auth.selectors';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Login</h1>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" />
        @if (form.controls.email.touched && form.controls.email.hasError('required')) {
          <span>Email is required</span>
        }
        @if (form.controls.email.touched && form.controls.email.hasError('email')) {
          <span>Enter a valid email</span>
        }
      </div>

      <div>
        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password" />
        @if (form.controls.password.touched && form.controls.password.hasError('required')) {
          <span>Password is required</span>
        }
      </div>

      @if (error()) {
        <p>{{ error() }}</p>
      }

      <button type="submit" [disabled]="loading()">
        {{ loading() ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
  `,
})
export class Login {
  private readonly store = inject(Store);

  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly error   = this.store.selectSignal(selectAuthError);

  readonly form = new FormGroup({
    email:    new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(AuthActions.login(this.form.getRawValue()));
  }
}
