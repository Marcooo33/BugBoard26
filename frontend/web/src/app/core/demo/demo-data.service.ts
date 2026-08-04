import { Injectable, signal } from '@angular/core';
import { Project } from '../../modules/home/sidebar/sidebar-element/project/project-model';
import {
  IIssue,
  INewIssue,
  TIssuePriority,
  TIssueState,
  TIssueType,
} from '../../modules/home/content-view/issues-list/issue-card/issue/issue';
import { IUser, TUserRole } from '../../modules/profile/user/user';
import { TIssueEvent } from '../../modules/home/content-view/issue-view/issue-event-card/issue-events/issue-event-model';
import { Comment } from '../../modules/home/content-view/issue-view/issue-event-card/issue-events/comment-event/comment-card/comment/comment';

type ChangeEvent =
  | { type: 'CHANGE'; changeType: 'TITLE'; oldTitle: string; newTitle: string }
  | { type: 'CHANGE'; changeType: 'DESCRIPTION'; oldDescription: string; newDescription: string }
  | { type: 'CHANGE'; changeType: 'PRIORITY'; oldPriority: TIssuePriority; newPriority: TIssuePriority }
  | { type: 'CHANGE'; changeType: 'STATE'; oldState: TIssueState; newState: TIssueState };

type ChangePayload =
  | { type: 'TITLE'; newTitle: string }
  | { type: 'DESCRIPTION'; newDescription: string }
  | { type: 'PRIORITY'; newPriority: TIssuePriority }
  | { type: 'STATE'; newState: TIssueState }
  | { type: 'TITLE' | 'DESCRIPTION' | 'PRIORITY' | 'STATE' };

type DemoIssueEvent = TIssueEvent & {
  uuid: string;
  createdAt: string;
  type: 'COMMENT' | 'CHANGE';
  author: IUser;
};

// ---------- Seed users ----------

const U_DEMO: IUser = {
  uuid: 'u-demo',
  name: 'Demo',
  surname: 'Developer',
  email: 'demo@bugboard.local',
  role: 'DEVELOPER',
};

const U_ALICE: IUser = {
  uuid: 'u-alice',
  name: 'Alice',
  surname: 'Chen',
  email: 'alice.chen@example.com',
  role: 'DEVELOPER',
};

const U_MARCO: IUser = {
  uuid: 'u-marco',
  name: 'Marco',
  surname: 'Rossi',
  email: 'marco.rossi@example.com',
  role: 'DEVELOPER',
};

const U_JAMES: IUser = {
  uuid: 'u-james',
  name: 'James',
  surname: 'Wilson',
  email: 'james.wilson@example.com',
  role: 'VIEWER',
};

const U_SOFIA: IUser = {
  uuid: 'u-sofia',
  name: 'Sofia',
  surname: 'Martinez',
  email: 'sofia.martinez@example.com',
  role: 'VIEWER',
};

// ---------- Seed projects ----------

const P1: Project = {
  uuid: 'p-1',
  name: 'Refactoring del Frontend',
  createdAt: '2025-12-01T10:00:00.000Z',
};
const P2: Project = {
  uuid: 'p-2',
  name: 'Backend API v2',
  createdAt: '2025-12-10T14:30:00.000Z',
};
const P3: Project = {
  uuid: 'p-3',
  name: 'DevOps & CI/CD',
  createdAt: '2026-01-05T09:15:00.000Z',
};

// ---------- Seed issues ----------

const I1: IIssue = {
  uuid: 'i-1',
  title: 'Correggere il memory leak nella validazione JWT',
  description:
    'Il token interceptor JWT mantiene in memoria i riferimenti ai token scaduti. Quando i token scadono e ne vengono emessi di nuovi, i vecchi oggetti token non vengono mai liberati dal garbage collector perché le subscription ai subject mantengono riferimenti forti. Questo causa un aumento graduale della memoria heap sotto carico elevato di autenticazione.',
  type: 'BUG',
  priority: 'HIGH',
  state: 'TODO',
  author: U_ALICE,
};

const I2: IIssue = {
  uuid: 'i-2',
  title: 'Migrare HttpModule a provideHttpClient',
  description:
    'Diversi feature module caricati in modo lazy importano ancora il deprecato HttpClientModule invece di usare il nuovo approccio standalone provideHttpClient() introdotto in Angular 15. Dobbiamo migrare al nuovo pattern per abilitare gli interceptor tree-shakable e prepararci ad Angular 18+, dove il modulo legacy viene rimosso.',
  type: 'FEATURE',
  priority: 'MEDIUM',
  state: 'PENDING',
  author: U_MARCO,
};

const I3: IIssue = {
  uuid: 'i-3',
  title: 'Aggiornare la strategia di lazy-loading per Angular 17',
  description:
    'Angular 17 introduce una nuova sintassi di lazy-loading basata su ESBuild. La documentazione attuale fa ancora riferimento ai pattern loadChildren basati su NgModule, ormai deprecati. Dobbiamo aggiornare tutte le guide per usare il moderno approccio standalone-component e documentare le implicazioni sulle performance.',
  type: 'DOCUMENTATION',
  priority: 'LOW',
  state: 'DONE',
  author: U_JAMES,
};

const I4: IIssue = {
  uuid: 'i-4',
  title: 'Rifattorizzare la gestione dello stato da Services a Signals',
  description:
    'La gestione dello stato attuale si basa pesantemente su BehaviorSubject e subscription manuali. Con gli Angular 16+ Signals ora stabili, dovremmo rifattorizzare gli store core (IssueStore, ProjectStore, AuthStore) per usare writable signals e computed values. Questo riduce il boilerplate, elimina le subscription leak e migliora le performance della change detection.',
  type: 'FEATURE',
  priority: 'HIGH',
  state: 'PENDING',
  author: U_SOFIA,
};

const I5: IIssue = {
  uuid: 'i-5',
  title: 'Il layout CSS Grid non funziona su Safari iOS',
  description:
    "Il modo in cui Safari gestisce grid-template-rows: auto combinato con overflow: hidden fa sì che la sidebar venga renderizzata con altezza 0px su iOS 17.4+. Il problema è riproducibile sia su iPhone che su iPad. Chrome e Firefox renderizzano correttamente. È stato identificato un workaround che usa min-height: 0 sul container del grid.",
  type: 'BUG',
  priority: 'MEDIUM',
  state: 'TODO',
  author: U_DEMO,
};

const I6: IIssue = {
  uuid: 'i-6',
  title: 'Implementare il rate limiting su /auth/login',
  description:
    'L\'endpoint di autenticazione non ha attualmente alcun rate limiting, il che lo rende vulnerabile ad attacchi brute-force. Dobbiamo aggiungere un rate limiting basato su IP usando un algoritmo token-bucket, con soglie configurabili (es. 5 tentativi al minuto per IP). I tentativi falliti devono essere loggati e devono attivare un alert dopo il superamento di una soglia di avviso.',
  type: 'FEATURE',
  priority: 'HIGH',
  state: 'TODO',
  author: U_JAMES,
};

const I7: IIssue = {
  uuid: 'i-7',
  title: 'Memory leak rilevato nella SessionFactory di Hibernate',
  description:
    'Le istanze SessionFactory non vengono chiuse correttamente quando il context dell\'applicazione viene ricaricato. Questo causa un memory leak lento che diventa evidente dopo diversi hot-reload durante lo sviluppo. La correzione prevede di racchiudere le chiamate a sessionFactory.openSession() in blocchi try-with-resources.',
  type: 'BUG',
  priority: 'MEDIUM',
  state: 'DONE',
  author: U_ALICE,
};

const I8: IIssue = {
  uuid: 'i-8',
  title: 'La documentazione Swagger/OpenAPI non è aggiornata',
  description:
    'La documentazione API generata automaticamente da SpringDoc non riflette in modo accurato i nuovi schemi DTO introdotti in v2.1. Diversi endpoint mostrano request/response body obsoleti e i codici di errore del rate limiting non sono documentati. Dobbiamo aggiornare manualmente le annotazioni OpenAPI sui controller interessati.',
  type: 'DOCUMENTATION',
  priority: 'LOW',
  state: 'DONE',
  author: U_SOFIA,
};

const I9: IIssue = {
  uuid: 'i-9',
  title: 'La cache del build multi-stage di Docker non funziona',
  description:
    'L\'ordine dei layer del Dockerfile fa sì che npm install venga eseguito anche quando package.json non è cambiato, invalidando l\'intera cache del build. Questo aggiunge circa 4 minuti a ogni esecuzione della pipeline CI. La correzione prevede di riordinare le istruzioni COPY in modo che package.json e package-lock.json vengano copiati prima di eseguire npm ci.',
  type: 'BUG',
  priority: 'HIGH',
  state: 'PENDING',
  author: U_MARCO,
};

// ---------- Helper ----------

function comment(
  uuid: string,
  createdAt: string,
  author: IUser,
  text: string,
): Comment {
  return { uuid, createdAt, type: 'COMMENT', author, text };
}

// ---------- Seed events ----------

const EVENTS_P1_I2: DemoIssueEvent[] = [
  comment(
    'c-1',
    '2025-12-04T09:15:00.000Z',
    U_MARCO,
    "Ho iniziato la migrazione degli import dei moduli. Il problema principale è che diversi moduli caricati in modo lazy usano ancora il pattern HttpClientModule deprecato di Angular 14. Sto sostituendo ogni import singolarmente e verificando che gli interceptor continuino a funzionare con provideHttpClient.",
  ),
  comment(
    'c-2',
    '2025-12-04T14:30:00.000Z',
    U_ALICE,
    'Dovremmo anche valutare di usare withInterceptors() per il nuovo approccio provideHttpClient invece del token HTTP_INTERCEPTORS basato su classi. Questo renderebbe i nostri interceptor tree-shakable e migliorerebbe il tempo di avvio.',
  ),
];

const EVENTS_P1_I3: DemoIssueEvent[] = [
  comment(
    'c-3',
    '2026-01-15T11:00:00.000Z',
    U_JAMES,
    "Angular 17 introduce la nuova sintassi di lazy-loading con ESBuild. Ho aggiornato la documentazione per coprire i passaggi di migrazione da loadChildren basato su NgModule al pattern import() dei standalone component. Ho aggiunto benchmark sulle performance che mostrano un miglioramento del 12% nella dimensione iniziale del bundle.",
  ),
  {
    uuid: 'ch-1',
    createdAt: '2026-01-15T11:05:00.000Z',
    type: 'CHANGE',
    author: U_JAMES,
    changeType: 'STATE',
    oldState: 'TODO' as TIssueState,
    newState: 'DONE' as TIssueState,
  },
];

const EVENTS_P1_I4: DemoIssueEvent[] = [
  comment(
    'c-4',
    '2026-01-11T10:00:00.000Z',
    U_SOFIA,
    'La gestione dello stato attuale usa BehaviorSubject in modo estensivo in IssueStore, ProjectStore e AuthStore. Propongo una migrazione graduale a Signals, partendo dagli store più semplici. I nostri benchmark preliminari mostrano una riduzione di circa il 15% dei cicli di change detection.',
  ),
  comment(
    'c-5',
    '2026-01-12T08:45:00.000Z',
    U_MARCO,
    'Buona idea. Suggerisco di partire dall\'IssueStore, dato che ha il flusso di dati più semplice — solo una lista di issue con filtri. Il ProjectStore potrà seguire una volta convalidato l\'approccio.',
  ),
  comment(
    'c-6',
    '2026-01-13T16:20:00.000Z',
    U_ALICE,
    'Ho alcune preoccupazioni sulla compatibilità dei form basati su signal con i nostri componenti form personalizzati. Dovremmo eseguire la suite di test di integrazione prima di impegnarci su questa architettura, in particolare per i flussi di creazione e modifica delle issue.',
  ),
  comment(
    'c-7',
    '2026-01-14T09:00:00.000Z',
    U_SOFIA,
    "Osservazione valida. Dovremmo prima verificare la compatibilità. Ho alzato la priorità a HIGH perché questo impatta l'intero layer dello stato e potrebbe bloccare la migrazione ad Angular 17 se non allineiamo l'architettura.",
  ),
  {
    uuid: 'ch-2',
    createdAt: '2026-01-14T09:01:00.000Z',
    type: 'CHANGE',
    author: U_SOFIA,
    changeType: 'PRIORITY',
    oldPriority: 'MEDIUM' as TIssuePriority,
    newPriority: 'HIGH' as TIssuePriority,
  },
];

const EVENTS_P1_I5: DemoIssueEvent[] = [
  comment(
    'c-8',
    '2026-01-21T10:30:00.000Z',
    U_DEMO,
    "Il problema sembra essere legato al modo in cui Safari gestisce grid-template-rows: auto combinato con overflow: hidden. L'elemento del grid si comprime a un'altezza di 0 perché auto si risolve nella dimensione del contenuto, che è 0 quando overflow è hidden. Aggiungere min-height: 0 sul container del grid risolve il rendering.",
  ),
];

const EVENTS_P2_I6: DemoIssueEvent[] = [
  comment(
    'c-9',
    '2025-12-13T09:00:00.000Z',
    U_ALICE,
    'Dovremmo implementare un algoritmo token bucket. Il confronto con un approccio a sliding window mostra che il token bucket è più efficiente del 30% in termini di memoria per la nostra scala e gestisce il traffico a raffiche in modo più elegante.',
  ),
  comment(
    'c-10',
    '2025-12-14T11:45:00.000Z',
    U_JAMES,
    'Assicuratevi di aggiungere gli header di rate limit (X-RateLimit-Remaining, X-RateLimit-Reset) alla risposta. Il team frontend ne ha bisogno per implementare la logica di retry nell\'interceptor di autenticazione. Inoltre, aggiungete un header Retry-After per le risposte 429.',
  ),
];

const EVENTS_P2_I7: DemoIssueEvent[] = [
  comment(
    'c-11',
    '2025-12-16T10:00:00.000Z',
    U_MARCO,
    'Il leak si verifica quando si chiama sessionFactory.openSession() senza chiuderlo in un blocco try-with-resources. Corretto nel commit a7f3b2c. Ho anche scoperto che l\'infrastruttura di test creava sessioni aggiuntive senza cleanup — risolto nello stesso commit.',
  ),
  {
    uuid: 'ch-3',
    createdAt: '2025-12-16T10:05:00.000Z',
    type: 'CHANGE',
    author: U_MARCO,
    changeType: 'STATE',
    oldState: 'TODO' as TIssueState,
    newState: 'PENDING' as TIssueState,
  },
  {
    uuid: 'ch-4',
    createdAt: '2025-12-16T10:30:00.000Z',
    type: 'CHANGE',
    author: U_MARCO,
    changeType: 'STATE',
    oldState: 'PENDING' as TIssueState,
    newState: 'DONE' as TIssueState,
  },
];

const EVENTS_P2_I8: DemoIssueEvent[] = [
  comment(
    'c-12',
    '2026-01-09T08:00:00.000Z',
    U_SOFIA,
    'La documentazione generata automaticamente da SpringDoc non analizza correttamente i nuovi DTO. Gli schemi v2.1 usano record annidati che SpringDoc non risolve automaticamente. Aggiornerò manualmente le annotazioni OpenAPI con i tag @Schema e @Operation sui metodi dei controller interessati.',
  ),
  comment(
    'c-13',
    '2026-01-09T14:00:00.000Z',
    U_ALICE,
    'Già che ci sei, potresti aggiungere esempi per le risposte di errore del rate limit (HTTP 429)? Il team frontend le sta chiedendo per testare la gestione degli errori. Inoltre, i parametri di query per la paginazione mancano nella documentazione dell\'endpoint GET /issues.',
  ),
  comment(
    'c-14',
    '2026-01-10T09:30:00.000Z',
    U_JAMES,
    'Grazie Sofia, la documentazione aggiornata è molto utile per i nostri test di integrazione. Gli esempi per le risposte 429 e i parametri di paginazione ora corrispondono perfettamente al comportamento reale dell\'API.',
  ),
  {
    uuid: 'ch-5',
    createdAt: '2026-01-10T09:45:00.000Z',
    type: 'CHANGE',
    author: U_SOFIA,
    changeType: 'STATE',
    oldState: 'PENDING' as TIssueState,
    newState: 'DONE' as TIssueState,
  },
];

const EVENTS_P3_I9: DemoIssueEvent[] = [
  comment(
    'c-15',
    '2026-01-13T08:15:00.000Z',
    U_ALICE,
    'Il problema è nell\'ordine dei layer del Dockerfile. Copiavamo l\'intera directory del sorgente prima di eseguire npm ci, il che invalida la cache a ogni modifica del codice. La correzione consiste nel copiare prima package.json e package-lock.json, eseguire npm ci, e poi copiare il resto. Questo dovrebbe ripristinare i build cache hit e far risparmiare circa 4 minuti per esecuzione CI. Ho alzato la priorità a HIGH perché rallenta ogni PR.',
  ),
  {
    uuid: 'ch-6',
    createdAt: '2026-01-13T08:16:00.000Z',
    type: 'CHANGE',
    author: U_ALICE,
    changeType: 'PRIORITY',
    oldPriority: 'MEDIUM' as TIssuePriority,
    newPriority: 'HIGH' as TIssuePriority,
  },
];

// ---------- Service ----------

@Injectable({
  providedIn: 'root',
})
export class DemoDataService {
  readonly isActive = signal(false);

  private projects: Project[] = [];
  private issues: Map<string, IIssue[]> = new Map();
  private events: Map<string, DemoIssueEvent[]> = new Map();
  private idCounter = 1000;

  constructor() {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo') === '1') {
      this.seedData();
      this.isActive.set(true);
    }
  }

  ensureSeeded(): void {
    if (this.projects.length === 0) {
      this.seedData();
    }
  }

  // ---------- Reset ----------

  resetData(reSeed: boolean = true): void {
    this.projects = [];
    this.issues.clear();
    this.events.clear();
    this.idCounter = 1000;
    if (reSeed) {
      this.seedData();
    }
  }

  // ---------- Read ----------

  getProjects(): Project[] {
    return [...this.projects];
  }

  getProjectIssues(
    projectUuid: string,
    filters?: { type?: string; priority?: string; state?: string },
  ): IIssue[] {
    let list = this.issues.get(projectUuid) ?? [];
    if (filters) {
      if (filters.type) list = list.filter((i) => i.type === filters.type);
      if (filters.priority)
        list = list.filter((i) => i.priority === filters.priority);
      if (filters.state)
        list = list.filter((i) => i.state === filters.state);
    }
    return [...list];
  }

  getIssueEvents(projectUuid: string, issueUuid: string): TIssueEvent[] {
    // return events for the issue within the project
    return [...(this.events.get(issueUuid) ?? [])] as TIssueEvent[];
  }

  // ---------- Write ----------

  createProject(name: string): Project {
    const project: Project = {
      uuid: `p-${++this.idCounter}`,
      name,
      createdAt: new Date().toISOString(),
    };
    this.projects = [...this.projects, project];
    this.issues.set(project.uuid, []);
    return { ...project };
  }

  createIssue(projectUuid: string, newIssue: INewIssue): IIssue {
    const issue: IIssue = {
      uuid: `i-${++this.idCounter}`,
      ...newIssue,
      author: U_DEMO,
    };
    const current = this.issues.get(projectUuid) ?? [];
    this.issues.set(projectUuid, [...current, issue]);
    this.events.set(issue.uuid, []);
    return { ...issue };
  }

  createComment(
    _projectUuid: string,
    issueUuid: string,
    text: string,
  ): Comment {
    const newComment: Comment = {
      uuid: `c-${++this.idCounter}`,
      createdAt: new Date().toISOString(),
      type: 'COMMENT',
      author: U_DEMO,
      text,
    };
    const current = this.events.get(issueUuid) ?? [];
    this.events.set(issueUuid, [...current, newComment]);
    return { ...newComment };
  }

  sendChange(
    projectUuid: string,
    issueUuid: string,
    change: ChangePayload,
  ): void {
    const issueList = this.issues.get(projectUuid);
    if (!issueList) return;

    const idx = issueList.findIndex((i) => i.uuid === issueUuid);
    if (idx === -1) return;

    const issue = issueList[idx];

    let changeEvent: ChangeEvent;

    switch (change.type) {
      case 'TITLE': {
        const c = change as { type: 'TITLE'; newTitle: string };
        changeEvent = {
          type: 'CHANGE',
          changeType: 'TITLE',
          oldTitle: issue.title,
          newTitle: c.newTitle,
        };
        issueList[idx] = { ...issue, title: c.newTitle };
        break;
      }
      case 'DESCRIPTION': {
        const c = change as {
          type: 'DESCRIPTION';
          newDescription: string;
        };
        changeEvent = {
          type: 'CHANGE',
          changeType: 'DESCRIPTION',
          oldDescription: issue.description,
          newDescription: c.newDescription,
        };
        issueList[idx] = { ...issue, description: c.newDescription };
        break;
      }
      case 'PRIORITY': {
        const c = change as {
          type: 'PRIORITY';
          newPriority: TIssuePriority;
        };
        changeEvent = {
          type: 'CHANGE',
          changeType: 'PRIORITY',
          oldPriority: issue.priority,
          newPriority: c.newPriority,
        };
        issueList[idx] = { ...issue, priority: c.newPriority };
        break;
      }
      case 'STATE': {
        const c = change as {
          type: 'STATE';
          newState: TIssueState;
        };
        changeEvent = {
          type: 'CHANGE',
          changeType: 'STATE',
          oldState: issue.state,
          newState: c.newState,
        };
        issueList[idx] = { ...issue, state: c.newState };
        break;
      }
      default:
        return;
    }

    this.issues.set(projectUuid, issueList);

    const eventWithMeta: DemoIssueEvent = {
      uuid: `ch-${++this.idCounter}`,
      createdAt: new Date().toISOString(),
      author: U_DEMO,
      ...changeEvent,
    };

    const current = this.events.get(issueUuid) ?? [];
    this.events.set(issueUuid, [...current, eventWithMeta]);
  }

  // ---------- Seed data ----------

  private seedData(): void {
    this.projects = [P1, P2, P3];
    this.issues.set(P1.uuid, [I1, I2, I3, I4, I5]);
    this.issues.set(P2.uuid, [I6, I7, I8]);
    this.issues.set(P3.uuid, [I9]);

    this.events.set(I1.uuid, []);
    this.events.set(I2.uuid, [...EVENTS_P1_I2]);
    this.events.set(I3.uuid, [...EVENTS_P1_I3]);
    this.events.set(I4.uuid, [...EVENTS_P1_I4]);
    this.events.set(I5.uuid, [...EVENTS_P1_I5]);
    this.events.set(I6.uuid, [...EVENTS_P2_I6]);
    this.events.set(I7.uuid, [...EVENTS_P2_I7]);
    this.events.set(I8.uuid, [...EVENTS_P2_I8]);
    this.events.set(I9.uuid, [...EVENTS_P3_I9]);
  }
}
