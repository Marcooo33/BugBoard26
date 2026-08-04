import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoDataService } from './demo-data.service';
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
  private readonly demoData = inject(DemoDataService);
  private readonly projectApi = inject(ProjectApi);
  private readonly issueApi = inject(IssueApi);
  private readonly issueEventApi = inject(IssueEventApi);

  resetDemo(): void {
    this.demoData.resetData(true);
    this.projectApi.projectsResource.reload();
    this.issueApi.issuesResource.reload();
    this.issueEventApi.issueEventsResource.reload();
  }

  exitDemo(): void {
    sessionStorage.removeItem('demo');
    localStorage.removeItem('auth');
    window.location.href = '/';
  }
}
