import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./domains/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'conversations',
    canActivate: [authGuard],
    loadChildren: () => import('./domains/conversations/conversations.routes').then(m => m.CONVERSATIONS_ROUTES),
  },
];
