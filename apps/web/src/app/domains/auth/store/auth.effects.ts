import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map(res => AuthActions.loginSuccess(res)),
          catchError(err =>
            of(AuthActions.loginFailure({ error: err.error?.message ?? 'Login failed' }))
          ),
        ),
      ),
    ),
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, username, password, displayName }) =>
        this.authService.register({ email, username, password, displayName }).pipe(
          map(res => AuthActions.registerSuccess(res)),
          catchError(err =>
            of(AuthActions.registerFailure({ error: err.error?.message ?? 'Registration failed' }))
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(({ accessToken, refreshToken }) => {
        this.storage.saveTokens(accessToken, refreshToken);
        this.router.navigate(['/conversations']);
      }),
    ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.storage.clearTokens();
        this.router.navigate(['/auth/login']);
      }),
    ),
    { dispatch: false },
  );
}
