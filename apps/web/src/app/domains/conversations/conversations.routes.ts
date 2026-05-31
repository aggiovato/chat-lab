import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { conversationsReducer } from './store/conversations.reducer';
import { ConversationsEffects } from './store/conversations.effects';

export const CONVERSATIONS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState('conversations', conversationsReducer),
      provideEffects(ConversationsEffects),
    ],
    loadComponent: () => import('./pages/list/conversation-list').then(m => m.ConversationList),
  },
];
