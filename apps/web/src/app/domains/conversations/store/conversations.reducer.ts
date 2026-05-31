import { createReducer, on } from '@ngrx/store';
import { ConversationsActions } from './conversations.actions';
import { conversationsAdapter, initialConversationsState } from './conversations.state';

export const conversationsReducer = createReducer(
  initialConversationsState,

  on(ConversationsActions.loadAll, (state) => ({
    ...state, loading: true, error: null,
  })),

  on(ConversationsActions.loadAllSuccess, (state, { conversations }) =>
    conversationsAdapter.setAll(conversations, { ...state, loading: false }),
  ),

  on(ConversationsActions.loadAllFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),
);
