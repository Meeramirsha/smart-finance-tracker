import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FinanceService } from './finance.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-dot"></div>
        FinFlow
      </div>
      
      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span>📊</span> Dashboard
        </a>
        <a routerLink="/transactions" routerLinkActive="active" class="nav-link">
          <span>💸</span> Transactions
        </a>
        <a routerLink="/budgets" routerLinkActive="active" class="nav-link">
          <span>🛡️</span> Budgets
        </a>
        <a routerLink="/categories" routerLinkActive="active" class="nav-link">
          <span>🏷️</span> Categories
        </a>
        <a routerLink="/insights" routerLinkActive="active" class="nav-link">
          <span>✦</span> AI Insights
        </a>
      </nav>

      <div class="logout-btn">
        <button (click)="logout()" class="btn btn-secondary" style="width: 100%; border-color: transparent; text-align: left; padding: 0.8rem 1rem;">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private router = inject(Router);
  private financeService = inject(FinanceService);

  logout() {
    this.financeService.logout();
    this.router.navigate(['/']);
  }
}
