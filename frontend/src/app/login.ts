import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="auth-layout fade-in">
      <div class="auth-sidebar">
        <div class="logo">
          <div class="logo-dot"></div>
          FinFlow
        </div>
        <div class="auth-sidebar-body">
          <h2 style="font-size: 2.25rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 1rem;">Simple. Intelligent. Personal.</h2>
          <p style="color: var(--text-muted); line-height: 1.6; font-size: 1.05rem;">Keep your transactions categorized, set healthy budgets, and gain automated insights to help you save.</p>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          &copy; 2026 FinFlow
        </div>
      </div>

      <div class="auth-content">
        <div class="auth-card">
          <div style="margin-bottom: 2.5rem;">
            <h1 style="font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em;">Sign In</h1>
            <p style="color: var(--text-secondary); margin-top: 0.25rem;">Access your dashboard and financial insights</p>
          </div>

          @if (errorMessage()) {
            <div class="badge badge-danger" style="display: block; width: 100%; padding: 0.8rem; margin-bottom: 1.5rem; text-align: center; border-radius: 8px; font-weight: 500;">
              {{ errorMessage() }}
            </div>
          }

          <form (submit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="email">Email address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="input-field" 
                [(ngModel)]="email" 
                placeholder="you@example.com" 
                required
                #emailInput="ngModel"
              />
            </div>

            <div class="form-group" style="margin-bottom: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label class="form-label" for="password" style="margin-bottom: 0;">Password</label>
              </div>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="input-field" 
                [(ngModel)]="password" 
                placeholder="••••••••" 
                required
                #passwordInput="ngModel"
              />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem;" [disabled]="isLoading()">
              {{ isLoading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p style="margin-top: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
            Don't have an account? 
            <a routerLink="/register" style="color: var(--text-primary); font-weight: 600;">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private router = inject(Router);
  private financeService = inject(FinanceService);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill out all fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.financeService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
