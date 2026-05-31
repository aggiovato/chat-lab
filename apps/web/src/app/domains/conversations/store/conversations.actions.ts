import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Conversation } from '../models/conversation.models';

export const ConversationsActions = createActionGroup({
  source: 'Conversations',
  events: {
    'Load All':         emptyProps(),
    'Load All Success': props<{ conversations: Conversation[] }>(),
    'Load All Failure': props<{ error: string }>(),
  },
});
