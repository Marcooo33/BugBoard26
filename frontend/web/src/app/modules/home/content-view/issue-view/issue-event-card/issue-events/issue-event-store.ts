import { computed, inject, Injectable, signal } from '@angular/core';
import { IssueEventApi } from './issue-event-api';
import { Comment } from './comment-event/comment-card/comment/comment';
import { TIssueEvent } from './issue-event-model';
import { forkJoin, tap, Observable, of, finalize } from 'rxjs';

export interface IssueEventsState {
  issueEvents: TIssueEvent[];
  loading: boolean;
  error: Error | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class IssueEventStore {
  private readonly api = inject(IssueEventApi);
    
  private readonly state = computed<IssueEventsState>(() => ({
    issueEvents: this.api.issueEventsResource.hasValue() ? this.api.issueEventsResource.value() : [] as TIssueEvent[],
    loading: this.api.issueEventsResource.isLoading(),
    error: this.api.issueEventsResource.error()
  })); 

  readonly issueEvents = computed(() => this.state().issueEvents);
  readonly loading = computed(() => this.state().loading); 
  readonly error = computed(() => this.state().error);

  private readonly _commentCreating = signal(false);
  readonly commentCreating = this._commentCreating.asReadonly();

  private readonly _changeCreating = signal(false);
  readonly changeCreating = this._changeCreating.asReadonly();

  sendChanges(changes: any[]): Observable<any> {
    if (!changes || changes.length === 0) {
      return of([]);
    }
    this._changeCreating.set(true);
    const requests = changes.map(change => this.api.sendChanges(change));
    return forkJoin(requests).pipe(
      tap(() => this.api.issueEventsResource.reload()),
      finalize(() => this._changeCreating.set(false))
    );
  }

  createComment(comment: Comment["text"]): Observable<Comment> {
    this._commentCreating.set(true);
    return this.api.createComment(comment).pipe(
      tap(() => this.api.issueEventsResource.reload()),
      finalize(() => this._commentCreating.set(false))
    );
  }
}
