import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ConversationsService } from '../services/conversations.service';
import { ConversationsActions } from './conversations.actions';

@Injectable()
export class ConversationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly conversationsService = inject(ConversationsService);

  loadAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationsActions.loadAll),
      switchMap(() =>
        this.conversationsService.findAll().pipe(
          map(conversations => ConversationsActions.loadAllSuccess({ conversations })),
          catchError(err =>
            of(ConversationsActions.loadAllFailure({ error: err.error?.message ?? 'Failed to load conversations' }))
          ),
        ),
      ),
    ),
  );
}
