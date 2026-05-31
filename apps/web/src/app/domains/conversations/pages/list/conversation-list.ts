import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConversationsActions } from '../../store/conversations.actions';
import { selectAllConversations, selectConversationsError, selectConversationsLoading } from '../../store/conversations.selectors';
import { selectUser } from '../../../auth/store/auth.selectors';
import { AuthActions } from '../../../auth/store/auth.actions';

@Component({
  selector: 'app-conversation-list',
  template: `
    <header>
      <h1>Conversations</h1>
      @if (currentUser()) {
        <span>{{ currentUser()?.displayName ?? currentUser()?.username }}</span>
      }
      <button (click)="logout()">Logout</button>
    </header>

    @if (loading()) {
      <p>Loading conversations...</p>
    }

    @if (error()) {
      <p>Error: {{ error() }}</p>
    }

    @if (!loading() && conversations().length === 0) {
      <p>No conversations yet.</p>
    }

    <ul>
      @for (conv of conversations(); track conv.id) {
        <li>
          <strong>{{ conv.title ?? conversationName(conv) }}</strong>
          <span>{{ conv.type }}</span>
          <span>{{ conv.members.length }} members</span>
        </li>
      }
    </ul>
  `,
})
export class ConversationList implements OnInit {
  private readonly store = inject(Store);

  readonly conversations = this.store.selectSignal(selectAllConversations);
  readonly loading       = this.store.selectSignal(selectConversationsLoading);
  readonly error         = this.store.selectSignal(selectConversationsError);
  readonly currentUser   = this.store.selectSignal(selectUser);

  ngOnInit(): void {
    this.store.dispatch(ConversationsActions.loadAll());
  }

  conversationName(conv: { type: string; members: { user: { username: string } }[] }): string {
    if (conv.type === 'DIRECT') {
      const other = conv.members.find(m => m.user.username !== this.currentUser()?.username);
      return other?.user.username ?? 'Direct message';
    }
    return 'Group';
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
