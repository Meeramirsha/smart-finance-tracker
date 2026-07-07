import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';
import { SidebarComponent } from './sidebar';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  template: `
    <div class="app-container fade-in">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <header class="header-section">
          <div class="header-title">
            <h1>AI Financial Insights</h1>
            <p>Generative AI analysis of your monthly spending patterns, budget leaks, and savings challenges.</p>
          </div>
          <div class="header-actions">
            <button (click)="generateNewInsight()" class="btn btn-primary" [disabled]="isGenerating()">
              {{ isGenerating() ? 'Analyzing Transactions...' : '✦ Generate New Analysis' }}
            </button>
          </div>
        </header>

        <!-- Month/Year selector -->
        <section class="card" style="margin-bottom: 2.5rem; padding: 1rem 1.5rem;">
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; gap: 0.5rem;">
              <label class="form-label" style="margin-bottom: 0; white-space: nowrap;">Target Month:</label>
              <select [(ngModel)]="currentMonth" (change)="onDateChange()" class="input-field select-field" style="width: 140px; padding: 0.5rem 2rem 0.5rem 1rem;">
                <option [value]="1">January</option>
                <option [value]="2">February</option>
                <option [value]="3">March</option>
                <option [value]="4">April</option>
                <option [value]="5">May</option>
                <option [value]="6">June</option>
                <option [value]="7">July</option>
                <option [value]="8">August</option>
                <option [value]="9">September</option>
                <option [value]="10">October</option>
                <option [value]="11">November</option>
                <option [value]="12">December</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; gap: 0.5rem;">
              <label class="form-label" style="margin-bottom: 0; white-space: nowrap;">Target Year:</label>
              <select [(ngModel)]="currentYear" (change)="onDateChange()" class="input-field select-field" style="width: 100px; padding: 0.5rem 2rem 0.5rem 1rem;">
                <option [value]="2025">2025</option>
                <option [value]="2026">2026</option>
                <option [value]="2027">2027</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Generation Loading Overlay -->
        @if (isGenerating()) {
          <div class="card" style="text-align: center; padding: 5rem 1rem; margin-bottom: 2rem;">
            <span class="pulse-icon">✦</span>
            <h3 style="margin-top: 1rem; font-weight: 700;">Analyzing your expenses...</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.95rem;">
              We are connecting to Gemini to read your transactions, assess budget compliance, and detect leaks. This may take 5-10 seconds.
            </p>
          </div>
        } @else if (error()) {
          <div class="card" style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary); border-color: #fca5a5;">
            <p style="font-weight: 600; color: var(--accent-danger);">{{ error() }}</p>
            <button (click)="fetchInsights()" class="btn btn-secondary" style="margin-top: 1rem;">Retry Fetching</button>
          </div>
        } @else if (!insight()) {
          <div class="card" style="text-align: center; padding: 5rem 1rem;">
            <span style="font-size: 2.5rem;">📊</span>
            <h3 style="margin-top: 1.5rem; font-weight: 700;">No AI analysis found for this month.</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem; font-size: 0.95rem;">
              Once you log transactions, generate a breakdown of your spending mood and patterns.
            </p>
            <button (click)="generateNewInsight()" class="btn btn-primary">Generate Monthly Analysis</button>
          </div>
        } @else {
          <!-- Main Insights Layout -->
          <div class="insights-grid fade-in">
            <!-- Row 1: Story & Mood Card -->
            <div class="card insight-hero-card">
              <div class="hero-card-header">
                <span class="badge" [class]="getMoodBadgeClass(insight().mood)">
                  SPENDING MOOD: {{ insight().mood }}
                </span>
                <span class="hero-spark">✦</span>
              </div>
              <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.02em;">
                Monthly Money Story
              </h2>
              <p class="money-story-text">
                {{ insight().moneyStory }}
              </p>
            </div>

            <!-- Row 2: Leaks and Challenges -->
            <div class="double-grid">
              <!-- Expense Leak Detection Card -->
              <div class="card leak-card">
                <div class="card-icon-header">
                  <span class="icon bg-red">🔍</span>
                  <span class="card-title" style="margin-bottom: 0;">Expense Leaks Detected</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.25rem;">
                  Repeated small transactions or invisible leaks that accumulate into significant sums.
                </p>
                <ul class="leak-list">
                  @for (leak of insight().leaks; track leak) {
                    <li>
                      <span class="leak-bullet">&rarr;</span>
                      {{ leak }}
                    </li>
                  } @empty {
                    <li style="color: var(--accent-success); font-weight: 600;">
                      No major expense leaks detected. Excellent budget discipline!
                    </li>
                  }
                </ul>
              </div>

              <!-- Invisible Savings Challenge Card -->
              <div class="card challenge-card" style="border-color: #cbd5e1; background-color: var(--accent-light);">
                <div class="card-icon-header">
                  <span class="icon bg-gold">🎯</span>
                  <span class="card-title" style="margin-bottom: 0; color: var(--accent);">Micro Savings Challenge</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.25rem;">
                  A micro-actionable target designed to increase your savings without affecting your standard of living.
                </p>
                <div class="challenge-content">
                  <p class="challenge-desc">
                    {{ insight().savingsChallenge }}
                  </p>
                  <div class="challenge-accept-box">
                    <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">
                      Target Savings Goal
                    </span>
                    <span style="font-size: 1.2rem; font-weight: 800; color: var(--accent-success); margin-top: 0.1rem;">
                      Up to ₹40 / week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 3: Actionable Recommendations -->
            <div class="card recommendations-card">
              <div class="card-icon-header" style="margin-bottom: 1.25rem;">
                <span class="icon bg-blue">💡</span>
                <span class="card-title" style="margin-bottom: 0;">Strategic Recommendations</span>
              </div>
              <div class="recommendations-list">
                @for (rec of insight().recommendations; track rec) {
                  <div class="recommendation-item">
                    <span class="rec-num">0{{ $index + 1 }}</span>
                    <p class="rec-text">{{ rec }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .insights-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .insight-hero-card {
      padding: 2.25rem;
      border-radius: 16px;
    }

    .hero-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .hero-spark {
      font-size: 1.5rem;
      color: #7c3aed;
      animation: rotateSpark 3s linear infinite;
    }

    @keyframes rotateSpark {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .money-story-text {
      font-size: 1.1rem;
      line-height: 1.7;
      color: var(--text-primary);
    }

    .double-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
    }

    @media (max-width: 800px) {
      .double-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .card-icon-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .card-icon-header .icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .bg-red { background-color: var(--accent-danger-light); color: var(--accent-danger); }
    .bg-gold { background-color: var(--accent-warning-light); color: var(--accent-warning); }
    .bg-blue { background-color: var(--accent-light); color: var(--accent); }

    .leak-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .leak-list li {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .leak-bullet {
      color: var(--accent-danger);
      font-weight: 700;
    }

    .challenge-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }

    .challenge-desc {
      font-size: 0.95rem;
      line-height: 1.5;
      font-weight: 500;
      color: var(--text-primary);
    }

    .challenge-accept-box {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      align-self: flex-start;
    }

    .recommendations-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 700px) {
      .recommendations-list {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    .recommendation-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.25rem;
    }

    .rec-num {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-muted);
      font-family: monospace;
      line-height: 1;
    }

    .rec-text {
      font-size: 0.9rem;
      line-height: 1.5;
      font-weight: 500;
      color: var(--text-primary);
    }

    .pulse-icon {
      font-size: 3rem;
      color: #7c3aed;
      display: inline-block;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.6; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class InsightsComponent implements OnInit {
  private financeService = inject(FinanceService);

  insight = signal<any>(null);
  isGenerating = signal(false);
  error = signal('');

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.fetchInsights();
  }

  fetchInsights() {
    this.error.set('');
    this.financeService.getAiInsights(this.currentMonth, this.currentYear).subscribe({
      next: (data) => {
        if (data && data.insightText) {
          try {
            const parsed = JSON.parse(data.insightText);
            this.insight.set({
              mood: data.moodStatus || parsed.mood || 'stable',
              moneyStory: parsed.moneyStory,
              leaks: parsed.leaks || [],
              savingsChallenge: parsed.savingsChallenge,
              recommendations: parsed.recommendations || []
            });
          } catch {
            this.insight.set({
              mood: data.moodStatus || 'stable',
              moneyStory: data.insightText,
              leaks: [],
              savingsChallenge: 'No active savings challenges found. Check back later!',
              recommendations: ['Check your monthly budget allocations.']
            });
          }
        } else {
          this.insight.set(null);
        }
      },
      error: (e) => {
        console.error(e);
        this.error.set('Failed to load insights.');
      }
    });
  }

  generateNewInsight() {
    this.isGenerating.set(true);
    this.error.set('');
    this.financeService.generateAiInsight(this.currentMonth, this.currentYear).subscribe({
      next: () => {
        this.isGenerating.set(false);
        this.fetchInsights();
      },
      error: (err) => {
        this.isGenerating.set(false);
        this.error.set(err.error?.message || 'Failed to generate financial analysis. Check your transactions.');
      }
    });
  }

  onDateChange() {
    this.fetchInsights();
  }

  getMoodBadgeClass(mood: string): string {
    switch (mood?.toLowerCase()) {
      case 'strong': return 'badge-success';
      case 'warning': return 'badge-danger';
      default: return 'badge-warning';
    }
  }
}
