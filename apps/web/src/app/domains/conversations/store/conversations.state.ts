import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Conversation } from '../models/conversation.models';

export interface ConversationsState extends EntityState<Conversation> {
  loading: boolean;
  error: string | null;
}

export const conversationsAdapter = createEntityAdapter<Conversation>();

export const initialConversationsState: ConversationsState = conversationsAdapter.getInitialState({
  loading: false,
  error: null,
});
