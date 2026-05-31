import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConversationsState, conversationsAdapter } from './conversations.state';

export const selectConversationsState = createFeatureSelector<ConversationsState>('conversations');

const { selectAll } = conversationsAdapter.getSelectors();

export const selectAllConversations    = createSelector(selectConversationsState, selectAll);
export const selectConversationsLoading = createSelector(selectConversationsState, s => s.loading);
export const selectConversationsError   = createSelector(selectConversationsState, s => s.error);
