import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ENVIRONMENT_TOKEN } from '../../../environments/environment-model';
import { DemoDataService } from './demo-data.service';
import { demoInterceptor } from './demo.interceptor';

describe('Public demo HTTP isolation', () => {
  let http: HttpClient;
  let network: HttpTestingController;
  let demo: DemoDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([demoInterceptor])),
      provideHttpClientTesting(),
      { provide: ENVIRONMENT_TOKEN, useValue: { showcase: true, urls: { api: '/api' } } },
    ] });
    http = TestBed.inject(HttpClient);
    network = TestBed.inject(HttpTestingController);
    demo = TestBed.inject(DemoDataService);
  });
  afterEach(() => network.verify());

  it('blocks API requests outside demo and authentication requests inside it', () => {
    http.get('/api/projects').subscribe();
    network.expectNone('/api/projects');
    demo.isActive.set(true);
    http.post('/api/auth/login', {}).subscribe();
    network.expectNone('/api/auth/login');
  });

  it('returns seeded projects and locally created projects without using the network', () => {
    demo.ensureSeeded();
    demo.isActive.set(true);
    http.post('/api/projects', { name: 'Progetto di prova' }).subscribe();
    http.get<Array<{ name: string }>>('/api/projects').subscribe(projects => {
      expect(projects.some(p => p.name === 'Progetto di prova')).toBe(true);
    });
    network.expectNone('/api/projects');
  });
});
