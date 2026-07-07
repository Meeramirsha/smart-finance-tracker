import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';

@Component({
  selector: 'app-register',
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
            <h1 style="font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em;">Create Account</h1>
            <p style="color: var(--text-secondary); margin-top: 0.25rem;">Start tracking your money today</p>
          </div>

          @if (errorMessage()) {
            <div class="badge badge-danger" style="display: block; width: 100%; padding: 0.8rem; margin-bottom: 1.5rem; text-align: center; border-radius: 8px; font-weight: 500;">
              {{ errorMessage() }}
            </div>
          }
          @if (successMessage()) {
            <div class="badge badge-success" style="display: block; width: 100%; padding: 0.8rem; margin-bottom: 1.5rem; text-align: center; border-radius: 8px; font-weight: 500;">
              {{ successMessage() }}
            </div>
          }

          <form (submit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="name">Your Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="input-field" 
                [(ngModel)]="name" 
                placeholder="John Doe" 
                required
              />
            </div>

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
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="input-field" 
                [(ngModel)]="password" 
                placeholder="Min. 6 characters" 
                required
              />
            </div>

            <div class="form-group" style="margin-bottom: 2rem;">
              <label class="form-label" for="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                class="input-field" 
                [(ngModel)]="confirmPassword" 
                placeholder="Re-enter password" 
                required
              />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem;" [disabled]="isLoading()">
              {{ isLoading() ? 'Registering...' : 'Register' }}
            </button>
          </form>

          <p style="margin-top: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
            Already have an account? 
            <a routerLink="/login" style="color: var(--text-primary); font-weight: 600;">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private router = inject(Router);
  private financeService = inject(FinanceService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Please fill out all fields.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.financeService.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Try again.');
      }
    });
  }
}
