import { computed, inject, Injectable } from '@angular/core';
import { IssueEventApi } from './issue-event-api';
import { Comment } from './comment-event/comment-card/comment/comment';
import { TIssueEvent } from './issue-event-model';
import { forkJoin, tap, Observable, of } from 'rxjs';

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

  sendChanges(changes: any[]): Observable<any> {
    if (!changes || changes.length === 0) {
      return of([]);
    }
    const requests = changes.map(change => this.api.sendChanges(change));
    return forkJoin(requests).pipe(
      tap(() => this.api.issueEventsResource.reload())
    );
  }

  createComment(comment: Comment["text"]){
    this.api.createComment(comment).subscribe({
      next: (createdComment: Comment) => {
        this.api.issueEventsResource.reload();
      },
      error: (err: Error) => {
        console.error('Error creating comment: ', err);
      }
    })
  }
}
