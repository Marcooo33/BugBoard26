import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthStore } from '../../../core/auth/auth-store';
import { DemoDataService } from '../../../core/demo/demo-data.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authStore = inject(AuthStore)
  private readonly demoData = inject(DemoDataService)

  readonly isAdmin = computed(() => this.authStore.role()==="ADMIN");
  readonly demoPrefix = computed(() => this.demoData.isActive() ? '/demo' : '');
}
