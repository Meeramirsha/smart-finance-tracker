import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FinanceService } from './finance.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page fade-in">
      <header class="nav-bar">
        <div class="logo">
          <div class="logo-dot"></div>
          FinFlow
        </div>
        <div class="nav-actions">
          @if (financeService.isLoggedIn()) {
            <a routerLink="/dashboard" class="btn btn-primary">Go to Dashboard</a>
          } @else {
            <a routerLink="/login" class="btn btn-secondary">Sign In</a>
            <a routerLink="/register" class="btn btn-primary">Start for Free</a>
          }
        </div>
      </header>

      <main class="hero-section">
        <div class="hero-text">
          <span class="badge badge-success" style="margin-bottom: 1.5rem;">AI-Powered Personal Finance</span>
          <h1>Take control of your money, effortlessly.</h1>
          <p>A minimalist finance tracker built for students and freshers. Track expenses, set budgets, and unlock generative AI insights to optimize your spending.</p>
          <div class="hero-buttons">
            <a routerLink="/register" class="btn btn-primary btn-lg">Get Started Free</a>
            <a routerLink="/login" class="btn btn-secondary btn-lg">View Demo</a>
          </div>
        </div>

        <div class="preview-card card">
          <div class="preview-header">
            <div class="window-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <span class="preview-title">Dashboard Preview</span>
          </div>
          <div class="preview-content">
            <div class="preview-grid">
              <div class="mini-card">
                <span class="mini-label">Balance</span>
                <span class="mini-val">₹1,240.00</span>
              </div>
              <div class="mini-card">
                <span class="mini-label">Monthly Expenses</span>
                <span class="mini-val text-red">₹460.00</span>
              </div>
              <div class="mini-card">
                <span class="mini-label">Savings Rate</span>
                <span class="mini-val text-green">72.9%</span>
              </div>
            </div>
            <div class="preview-chart">
              <div class="chart-bar" style="height: 40%"></div>
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 35%"></div>
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-bar" style="height: 50%"></div>
              <div class="chart-bar active" style="height: 95%"></div>
            </div>
            <div class="preview-ai-insight">
              <div class="ai-header">
                <span class="ai-spark">✦</span>
                <strong>AI Money Story</strong>
              </div>
              <p>"Your food delivery leakage is down 15% this week. Keep going!"</p>
            </div>
          </div>
        </div>
      </main>

      <section class="features-grid">
        <div class="feature-item card">
          <span class="feature-icon">📊</span>
          <h3>Minimalist Dashboard</h3>
          <p>Clean totals, visual category splits, and monthly trends with absolute zero clutter.</p>
        </div>
        <div class="feature-item card">
          <span class="feature-icon">✦</span>
          <h3>AI Financial Insights</h3>
          <p>Get plain-English analysis of your transactions, identifying hidden leaks and generating micro-saving challenges.</p>
        </div>
        <div class="feature-item card">
          <span class="feature-icon">🛡️</span>
          <h3>Smart Budgeting</h3>
          <p>Interactive category budget limits with a visual risk meter warning you before you overspend.</p>
        </div>
      </section>

      <footer class="landing-footer">
        <p>&copy; 2026 FinFlow. Crafted with minimalism.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .nav-bar .logo {
      margin-bottom: 0;
    }

    .nav-actions {
      display: flex;
      gap: 0.75rem;
    }

    .hero-section {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      align-items: center;
      gap: 4rem;
      padding: 6rem 0;
    }

    @media (max-width: 900px) {
      .hero-section {
        grid-template-columns: 1fr;
        gap: 3rem;
        padding: 4rem 0;
        text-align: center;
      }
      .nav-bar {
        padding: 1.5rem 0;
      }
    }

    .hero-text h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.04em;
      margin-bottom: 1.5rem;
    }

    .hero-text p {
      font-size: 1.15rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 900px) {
      .hero-buttons {
        justify-content: center;
      }
    }

    .btn-lg {
      padding: 0.9rem 2rem;
      font-size: 1rem;
    }

    /* Preview Card styling */
    .preview-card {
      padding: 0;
      overflow: hidden;
      border-color: #e2e8f0;
      border-radius: 16px;
    }

    .preview-header {
      background-color: var(--accent-light);
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }

    .window-dots {
      display: flex;
      gap: 6px;
    }

    .window-dots .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #cbd5e1;
    }

    .preview-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-left: 1.5rem;
    }

    .preview-content {
      padding: 1.5rem;
      background-color: var(--bg-secondary);
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .mini-card {
      background-color: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
    }

    .mini-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .mini-val {
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 0.2rem;
    }

    .text-red { color: var(--accent-danger); }
    .text-green { color: var(--accent-success); }

    .preview-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 100px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .chart-bar {
      width: 12%;
      background-color: #cbd5e1;
      border-radius: 4px;
      transition: height 0.3s ease;
    }

    .chart-bar.active {
      background-color: var(--accent);
    }

    .preview-ai-insight {
      background-color: var(--accent-light);
      border-radius: 8px;
      padding: 0.8rem 1rem;
      font-size: 0.85rem;
    }

    .ai-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.3rem;
      color: var(--accent);
    }

    .ai-spark {
      color: #7c3aed;
    }

    /* Features Section */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      padding: 4rem 0;
      border-top: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .feature-item h3 {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .feature-item p {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .landing-footer {
      padding: 3rem 0;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class LandingComponent {
  financeService = inject(FinanceService);
}
