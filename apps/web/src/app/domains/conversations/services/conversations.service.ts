import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Conversation } from '../models/conversation.models';

@Injectable({ providedIn: 'root' })
export class ConversationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/conversations`;

  findAll(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.base);
  }
}
