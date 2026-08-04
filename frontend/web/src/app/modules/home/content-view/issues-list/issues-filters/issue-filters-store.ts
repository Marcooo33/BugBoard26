import { effect, inject, Injectable, signal } from "@angular/core";
import { TIssueType, TIssuePriority, TIssueState } from "../issue-card/issue/issue";
import { AuthStore } from '../../../../../core/auth/auth-store';

@Injectable({
  providedIn: 'root',
})
export class IssueFiltersStore {

  private readonly authStore = inject(AuthStore);

  private readonly _resetOnLogout = effect(() => {
    if (!this.authStore.jwt()) {
      this.resetState();
    }
  });

  readonly filtersModel = signal<IFilters>({
    type: "",
    priority: "",
    state: "",
  });

  setFilters(filters: IFilters) {
    this.filtersModel.set({
      type: filters.type,
      priority: filters.priority,
      state: filters.state,
    });
  }

  resetFilters() {
    this.filtersModel.set({
      type: "",
      priority: "",
      state: "",
    });
  }

  resetState() {
    this.resetFilters();
  }
}

export interface IFilters {
  type: TIssueType | "";
  priority: TIssuePriority | "";
  state: TIssueState | "";
};

export interface IQueryParams {
  type?: TIssueType;
  priority?: TIssuePriority;
  state?: TIssueState;
}