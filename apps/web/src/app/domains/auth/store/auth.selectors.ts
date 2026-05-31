import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser            = createSelector(selectAuthState, s => s.user);
export const selectIsAuthenticated = createSelector(selectUser, user => user !== null);
export const selectAuthLoading     = createSelector(selectAuthState, s => s.loading);
export const selectAuthError       = createSelector(selectAuthState, s => s.error);
