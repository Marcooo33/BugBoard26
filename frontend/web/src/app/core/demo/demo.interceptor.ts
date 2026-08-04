import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DemoDataService } from './demo-data.service';

function safeParseSegments(url: string): string[] {
  const idx = url.indexOf('/api/');
  if (idx === -1) return [];
  return url
    .substring(idx + 5)
    .split('?')[0]
    .split('/')
    .filter(Boolean);
}

export const demoInterceptor: HttpInterceptorFn = (req, next) => {
  const demo = inject(DemoDataService);

  if (
    !demo.isActive() ||
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/refresh')
  ) {
    return next(req);
  }

  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const seg = safeParseSegments(req.url);
  const method = req.method;

  // GET /api/projects
  if (seg.length === 1 && seg[0] === 'projects' && method === 'GET') {
    return ok(demo.getProjects());
  }

  // POST /api/projects
  if (seg.length === 1 && seg[0] === 'projects' && method === 'POST') {
    const body = req.body as { name?: string };
    const project = demo.createProject(body?.name ?? 'Untitled');
    return ok(project, 201);
  }

  // GET /api/projects/:uuid/issues?type=...&priority=...&state=...
  if (
    seg.length === 3 &&
    seg[0] === 'projects' &&
    seg[2] === 'issues' &&
    method === 'GET'
  ) {
    const filters = {
      type: req.params.get('type') || undefined,
      priority: req.params.get('priority') || undefined,
      state: req.params.get('state') || undefined,
    };
    return ok(demo.getProjectIssues(seg[1], filters));
  }

  // POST /api/projects/:uuid/issues
  if (
    seg.length === 3 &&
    seg[0] === 'projects' &&
    seg[2] === 'issues' &&
    method === 'POST'
  ) {
    const issue = demo.createIssue(seg[1], req.body as any);
    return ok(issue, 201);
  }

  // GET /api/projects/:uuid/:issueUuid/events
  if (
    seg.length === 4 &&
    seg[0] === 'projects' &&
    seg[3] === 'events' &&
    method === 'GET'
  ) {
    return ok(demo.getIssueEvents(seg[1], seg[2]));
  }

  // POST /api/projects/:uuid/:issueUuid/comment
  if (
    seg.length === 4 &&
    seg[0] === 'projects' &&
    seg[3] === 'comment' &&
    method === 'POST'
  ) {
    const body = req.body as { text?: string };
    const comment = demo.createComment(seg[1], seg[2], body?.text ?? '');
    return ok(comment, 201);
  }

  // PATCH /api/projects/:uuid/:issueUuid/change
  if (
    seg.length === 4 &&
    seg[0] === 'projects' &&
    seg[3] === 'change' &&
    method === 'PATCH'
  ) {
    demo.sendChange(seg[1], seg[2], req.body as any);
    return ok(null);
  }

  // PATCH /api/users/:uuid/email  – no-op in demo (read-only profile)
  if (
    seg.length === 3 &&
    seg[0] === 'users' &&
    seg[2] === 'email' &&
    method === 'PATCH'
  ) {
    return ok(null);
  }

  // PATCH /api/users/:uuid/password  – no-op in demo (read-only profile)
  if (
    seg.length === 3 &&
    seg[0] === 'users' &&
    seg[2] === 'password' &&
    method === 'PATCH'
  ) {
    return ok(null);
  }

  // PATCH /api/auth  – deprecated modifyUser, no-op in demo
  if (seg.length === 1 && seg[0] === 'auth' && method === 'PATCH') {
    return ok(null);
  }

  // Unrecognised but still under /api/ — return 404 to avoid real network call
  return notFound();
};

function ok<T>(body: T, status = 200): Observable<HttpResponse<T>> {
  return of(new HttpResponse<T>({ body, status }));
}

function notFound(): Observable<HttpResponse<{ message: string }>> {
  return of(
    new HttpResponse<{ message: string }>({
      body: { message: 'Not found' },
      status: 404,
    }),
  );
}
