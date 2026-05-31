import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../store/auth.selectors';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Register</h1>

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
        <label for="username">Username</label>
        <input id="username" type="text" formControlName="username" />
        @if (form.controls.username.touched && form.controls.username.hasError('required')) {
          <span>Username is required</span>
        }
        @if (form.controls.username.touched && form.controls.username.hasError('minlength')) {
          <span>Username must be at least 3 characters</span>
        }
      </div>

      <div>
        <label for="displayName">Display name (optional)</label>
        <input id="displayName" type="text" formControlName="displayName" />
      </div>

      <div>
        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password" />
        @if (form.controls.password.touched && form.controls.password.hasError('required')) {
          <span>Password is required</span>
        }
        @if (form.controls.password.touched && form.controls.password.hasError('minlength')) {
          <span>Password must be at least 8 characters</span>
        }
      </div>

      @if (error()) {
        <p>{{ error() }}</p>
      }

      <button type="submit" [disabled]="loading()">
        {{ loading() ? 'Registering...' : 'Register' }}
      </button>
    </form>

    <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
  `,
})
export class Register {
  private readonly store = inject(Store);

  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly error   = this.store.selectSignal(selectAuthError);

  readonly form = new FormGroup({
    email:       new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    username:    new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    displayName: new FormControl('', { nonNullable: true }),
    password:    new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { displayName, ...rest } = this.form.getRawValue();
    this.store.dispatch(AuthActions.register({ ...rest, displayName: displayName || undefined }));
  }
}
