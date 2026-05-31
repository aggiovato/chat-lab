import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { selectIsAuthenticated } from '../../domains/auth/store/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(Store).select(selectIsAuthenticated).pipe(
    map(authenticated => authenticated || router.createUrlTree(['/auth/login'])),
  );
};
