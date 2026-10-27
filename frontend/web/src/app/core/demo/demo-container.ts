import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '../auth/auth-store';
import { DemoDataService } from './demo-data.service';
import { ProjectStore } from '../../modules/home/sidebar/sidebar-element/project/project-store';
import { IssueStore } from '../../modules/home/content-view/issues-list/issue-card/issue/issue-store';
import { IssueFiltersStore } from '../../modules/home/content-view/issues-list/issues-filters/issue-filters-store';
import { ProjectApi } from '../../modules/home/sidebar/sidebar-element/project/project-api';
import { IssueApi } from '../../modules/home/content-view/issues-list/issue-card/issue/issue-api';
import { IssueEventApi } from '../../modules/home/content-view/issue-view/issue-event-card/issue-events/issue-event-api';

@Component({
  selector: 'app-demo-container',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './demo-container.html',
  styleUrl: './demo-container.css',
})
export class DemoContainer {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);
  private readonly demoData = inject(DemoDataService);
  private readonly projectApi = inject(ProjectApi);
  private readonly issueApi = inject(IssueApi);
  private readonly issueEventApi = inject(IssueEventApi);

  private readonly projectStore = inject(ProjectStore);
  private readonly issueStore = inject(IssueStore);
  private readonly filters = inject(IssueFiltersStore);

  private clearSelection(): void {
    this.projectStore.resetState();
    this.issueStore.resetState();
    this.filters.resetState();
  }

  resetDemo(): void {
    this.clearSelection();
    this.demoData.resetData(true);
    this.projectApi.projectsResource.reload();
    this.issueApi.issuesResource.reload();
    this.issueEventApi.issueEventsResource.reload();
  }

  leaveDemo(): boolean {
    this.clearSelection();
    this.demoData.isActive.set(false);
    this.auth.endDemo();
    this.demoData.resetData(false);
    return true;
  }

  exitDemo(): void {
    void this.router.navigate(['/']);
  }
}
