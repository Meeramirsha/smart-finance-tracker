import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';
import { SidebarComponent } from './sidebar';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [SidebarComponent, CurrencyPipe, PercentPipe, FormsModule],
  template: `
    <div class="app-container fade-in">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <header class="header-section">
          <div class="header-title">
            <h1>Monthly Budgets</h1>
            <p>Define spending thresholds and monitor your categories in real time.</p>
          </div>
          <div class="header-actions">
            <button (click)="openAddModal()" class="btn btn-primary">
              <span>+</span> Set Category Limit
            </button>
          </div>
        </header>

        <!-- Month Selector Section -->
        <section class="card" style="margin-bottom: 2rem; padding: 1rem 1.5rem;">
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

        <!-- Budgets Progress Grid -->
        <section>
          @if (budgets().length === 0) {
            <div class="card" style="text-align: center; padding: 5rem 1rem; color: var(--text-secondary);">
              <h3>No monthly budget limits found.</h3>
              <p style="margin-top: 0.5rem; margin-bottom: 1.5rem; font-size: 0.95rem;">Setting a budget will keep you alert to overspending.</p>
              <button (click)="openAddModal()" class="btn btn-primary">Set Up Budget Limit</button>
            </div>
          } @else {
            <div class="budgets-grid">
              @for (b of budgets(); track b.id) {
                <div class="card budget-card">
                  <div class="budget-card-header">
                    <span style="font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                      <span [style.color]="b.categoryColor">{{ b.categoryIcon || '🏷️' }}</span>
                      {{ b.categoryName }}
                    </span>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <span class="badge" [class]="getRiskBadgeClass(b.riskStatus)">{{ b.riskStatus }}</span>
                      <button (click)="deleteBudget(b.id)" class="delete-icon-btn" title="Remove budget limit">&times;</button>
                    </div>
                  </div>

                  <div class="budget-metrics">
                    <div class="metric">
                      <span class="metric-label">Spent</span>
                      <span class="metric-val" [class.over]="b.usedAmount > b.monthlyLimit">
                        {{ b.usedAmount | currency }}
                      </span>
                    </div>
                    <div class="metric" style="text-align: right;">
                      <span class="metric-label">Limit</span>
                      <span class="metric-val" style="color: var(--text-secondary);">
                        {{ b.monthlyLimit | currency }}
                      </span>
                    </div>
                  </div>

                  <!-- Visual Progress Bar -->
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill"
                         [style.width.%]="getPercent(b.usedAmount, b.monthlyLimit)"
                         [class.over]="b.usedAmount > b.monthlyLimit"
                         [class.warn]="b.usedAmount > b.monthlyLimit * 0.7 && b.usedAmount <= b.monthlyLimit">
                    </div>
                  </div>

                  <div class="budget-card-footer">
                    <span>{{ getPercent(b.usedAmount, b.monthlyLimit) / 100 | percent:'1.0-0' }} Spent</span>
                    @if (b.monthlyLimit - b.usedAmount >= 0) {
                      <span style="color: var(--accent-success);">{{ b.monthlyLimit - b.usedAmount | currency }} Remaining</span>
                    } @else {
                      <span style="color: var(--accent-danger);">Over by {{ b.usedAmount - b.monthlyLimit | currency }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </main>

      <!-- Set Limit Modal -->
      @if (showModal()) {
        <div class="modal-overlay">
          <div class="modal-content fade-in">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; letter-spacing: -0.02em;">Set Category Budget Limit</h3>
            
            @if (modalError()) {
              <div class="badge badge-danger" style="display: block; width: 100%; padding: 0.7rem; margin-bottom: 1rem; text-align: center;">
                {{ modalError() }}
              </div>
            }

            <form (submit)="saveBudget()">
              <div class="form-group">
                <label class="form-label" for="modalCategory">Category</label>
                <select id="modalCategory" name="modalCategory" class="input-field select-field" [(ngModel)]="modalCategoryId" required>
                  <option [value]="null" disabled selected>Select Category</option>
                  @for (cat of userCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 2rem;">
                <label class="form-label" for="modalLimit">Monthly Spend Limit (₹)</label>
                <input type="number" step="0.01" id="modalLimit" name="modalLimit" class="input-field" [(ngModel)]="modalLimit" placeholder="0.00" required />
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Threshold</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .budgets-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 800px) {
      .budgets-grid {
        grid-template-columns: 1fr;
      }
    }

    .budget-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .budget-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .delete-icon-btn {
      background: none;
      border: none;
      font-size: 1.4rem;
      font-weight: 300;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
      padding: 0 0.25rem;
      transition: var(--transition);
    }
    .delete-icon-btn:hover {
      color: var(--accent-danger);
    }

    .budget-metrics {
      display: flex;
      justify-content: space-between;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .metric-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    .metric-val {
      font-size: 1.25rem;
      font-weight: 700;
    }
    .metric-val.over {
      color: var(--accent-danger);
    }

    .progress-bar-container {
      height: 8px;
      background-color: var(--accent-light);
      border-radius: 4px;
      overflow: hidden;
      width: 100%;
    }

    .progress-bar-fill {
      height: 100%;
      background-color: var(--accent-success);
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .progress-bar-fill.warn {
      background-color: var(--accent-warning);
    }
    .progress-bar-fill.over {
      background-color: var(--accent-danger);
    }

    .budget-card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
      padding-top: 0.8rem;
    }
  `]
})
export class BudgetsComponent implements OnInit {
  private financeService = inject(FinanceService);

  budgets = signal<any[]>([]);
  userCategories = signal<any[]>([]);

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  // Modal models
  showModal = signal(false);
  modalCategoryId: number | null = null;
  modalLimit: number | null = null;
  modalError = signal('');

  ngOnInit() {
    this.fetchBudgets();
    this.fetchCategories();
  }

  fetchBudgets() {
    this.financeService.getBudgets(this.currentMonth, this.currentYear).subscribe({
      next: (data) => this.budgets.set(data),
      error: (e) => console.error(e)
    });
  }

  fetchCategories() {
    this.financeService.getCategories().subscribe({
      next: (data) => this.userCategories.set(data),
      error: (e) => console.error(e)
    });
  }

  onDateChange() {
    this.fetchBudgets();
  }

  getPercent(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min((used / limit) * 100, 100);
  }

  getRiskBadgeClass(status: string): string {
    switch (status) {
      case 'OVERSPENDING': return 'badge-danger';
      case 'WATCHFUL': return 'badge-warning';
      default: return 'badge-success';
    }
  }

  // Modal handlers
  openAddModal() {
    this.modalError.set('');
    this.modalCategoryId = null;
    this.modalLimit = null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveBudget() {
    if (!this.modalCategoryId) {
      this.modalError.set('Please select a category.');
      return;
    }
    if (!this.modalLimit || this.modalLimit <= 0) {
      this.modalError.set('Please enter a valid monthly limit.');
      return;
    }

    const payload = {
      categoryId: Number(this.modalCategoryId),
      monthlyLimit: this.modalLimit,
      month: this.currentMonth,
      year: this.currentYear
    };

    this.financeService.createOrUpdateBudget(payload).subscribe({
      next: () => {
        this.closeModal();
        this.fetchBudgets();
      },
      error: (err) => this.modalError.set(err.error?.message || 'Failed to save budget limit.')
    });
  }

  deleteBudget(id: number) {
    if (confirm('Are you sure you want to delete this budget limit?')) {
      this.financeService.deleteBudget(id).subscribe({
        next: () => this.fetchBudgets(),
        error: (e) => console.error(e)
      });
    }
  }
}
