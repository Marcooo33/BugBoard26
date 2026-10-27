import { Component, inject } from "@angular/core";
import { form, FormField } from "@angular/forms/signals";
import { IssueFiltersStore } from "./issue-filters-store";

@Component({
  selector: 'app-issues-filters',
  imports: [FormField],
  templateUrl: './issues-filters.html',
  styleUrl: './issues-filters.css',
})
export class IssuesFilters {

  private readonly filtersStore = inject(IssueFiltersStore);

  readonly filtersForm = form(this.filtersStore.filtersModel);
  
  resetFilters(){
    this.filtersStore.resetFilters();
  }

}