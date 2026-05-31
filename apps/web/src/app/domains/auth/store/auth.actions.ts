import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, RegisterRequest, User } from '../models/auth.models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login':            props<LoginRequest>(),
    'Login Success':    props<{ user: User; accessToken: string; refreshToken: string }>(),
    'Login Failure':    props<{ error: string }>(),

    'Register':         props<RegisterRequest>(),
    'Register Success': props<{ user: User; accessToken: string; refreshToken: string }>(),
    'Register Failure': props<{ error: string }>(),

    'Logout':           emptyProps(),
    'Restore Session':  props<{ user: User }>(),
  },
});
