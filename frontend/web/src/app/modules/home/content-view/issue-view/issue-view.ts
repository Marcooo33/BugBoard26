import { Component, computed, inject, Signal } from '@angular/core';
import { ProjectStore } from '../../sidebar/sidebar-element/project/project-store';
import { IssueStore } from '../issues-list/issue-card/issue/issue-store';
import { IssueEventStore } from './issue-event-card/issue-events/issue-event-store';
import { IssueEventCard } from "./issue-event-card/issue-event-card";
import { IssueCardFull } from "./issue-card-full/issue-card-full";
import { TIssueEvent } from './issue-event-card/issue-events/issue-event-model';
import { AddCommentCard } from "./add-comment-card/add-comment-card";
import { AuthStore } from '../../../../core/auth/auth-store';
import { IIssue } from '../issues-list/issue-card/issue/issue';
import { TypeLabel } from '../issues-list/issue-card/type-label/type-label';
import { PriorityLabel } from '../issues-list/issue-card/priority-label/priority-label';
import { StateLabel } from '../issues-list/issue-card/state-label/state-label';

@Component({
  selector: 'app-issue-view',
  imports: [IssueEventCard, IssueCardFull, AddCommentCard, TypeLabel, PriorityLabel, StateLabel],
  templateUrl: './issue-view.html',
  styleUrl: './issue-view.css',
})
export class IssueView {

  private readonly authStore = inject(AuthStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly issueStore = inject(IssueStore);
  private readonly issueEventStore = inject(IssueEventStore);

  /** The raw combined string e.g. "EcoTrack.Crash all'avvio su Android 14" */
  private readonly rawTitle: Signal<string> = computed(
    () => (this.projectStore.name() ?? '') + (this.issueStore.title())
  );

  /** Part before the first '.' — the project name */
  readonly projectName: Signal<string> = computed(() => {
    const raw = this.rawTitle();
    const dotIndex = raw.indexOf('.');
    return dotIndex !== -1 ? raw.substring(0, dotIndex) : raw;
  });

  /** Part after the first '.' — the issue title */
  readonly issueTitle: Signal<string> = computed(() => {
    const raw = this.rawTitle();
    const dotIndex = raw.indexOf('.');
    return dotIndex !== -1 ? raw.substring(dotIndex + 1) : '';
  });

  /** The selected issue, used to render the relocated tags in the header */
  readonly selectedIssue: Signal<IIssue | null> = computed(() => this.issueStore.selectedIssue());

  readonly issueEvents: Signal<TIssueEvent[]> = computed(() => this.issueEventStore.issueEvents());
  readonly isLoading = computed(() => this.issueEventStore.loading());
  readonly isViewer: Signal<boolean> = computed(() => this.authStore.role() === "VIEWER");

  deselectIssue() {
    this.issueStore.deselectIssue();
  }

}
