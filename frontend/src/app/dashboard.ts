import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';
import { FinanceService } from './finance.service';
import { SidebarComponent } from './sidebar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, RouterLink, CurrencyPipe, PercentPipe, DatePipe, FormsModule],
  template: `
    <div class="app-container fade-in">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <header class="header-section">
          <div class="header-title">
            <h1>Dashboard</h1>
            <p>Welcome back, {{ userName() }}! Here is your financial snapshot.</p>
          </div>
          <div class="header-actions">
            <button (click)="openQuickAdd()" class="btn btn-primary">
              <span>+</span> Quick Expense/Income
            </button>
          </div>
        </header>

        <!-- Summary Cards Grid -->
        <section class="summary-grid">
          <div class="card">
            <span class="card-title">Net Balance</span>
            <div class="summary-val" [class.negative]="summary().balance < 0">
              {{ summary().balance | currency }}
            </div>
            <span class="summary-subtitle">Available funds</span>
          </div>

          <div class="card">
            <span class="card-title">Total Monthly Income</span>
            <div class="summary-val positive">
              {{ summary().totalIncome | currency }}
            </div>
            <span class="summary-subtitle">Earned this month</span>
          </div>

          <div class="card">
            <span class="card-title">Total Monthly Expenses</span>
            <div class="summary-val negative">
              {{ summary().totalExpense | currency }}
            </div>
            <span class="summary-subtitle">Spent this month</span>
          </div>

          <div class="card">
            <span class="card-title">Monthly Savings Rate</span>
            <div class="summary-val accent-col">
              {{ summary().savingsRate / 100 | percent:'1.1-1' }}
            </div>
            <span class="summary-subtitle">Saved of total income</span>
          </div>
        </section>

        <!-- Main Dashboard Dashboard Content Grid -->
        <section class="dashboard-body-grid">
          
          <!-- Column 1: Charts & Lists -->
          <div class="dashboard-main-col">
            <!-- AI Insights Mini Card -->
            @if (aiInsightText()) {
              <div class="card ai-card-summary" style="margin-bottom: 2rem; border-color: #cbd5e1; background-color: var(--accent-light);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                  <h3 style="font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--accent);">
                    <span>✦</span> AI Monthly Money Story
                  </h3>
                  <span class="badge" [class]="getMoodBadgeClass(aiInsightMood())">{{ aiInsightMood() }}</span>
                </div>
                <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-primary); margin-bottom: 0.75rem;">
                  "{{ aiInsightText() }}"
                </p>
                <a routerLink="/insights" style="font-size: 0.85rem; font-weight: 600; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 0.25rem;">
                  See Full Analysis & Challenges &rarr;
                </a>
              </div>
            }

            <!-- Charts Section -->
            <div class="charts-row">
              <!-- Spending Category Split -->
              <div class="card chart-card">
                <span class="card-title">Spending Category Split</span>
                @if (categoriesBreakdown().length === 0) {
                  <div class="empty-chart">
                    <p>No expenses logged this month.</p>
                  </div>
                } @else {
                  <div class="category-chart-container">
                    <!-- Premium SVG Donut Chart -->
                    <div class="svg-container">
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f1f5f9" stroke-width="12" />
                        @for (slice of svgSlices(); track slice.categoryName) {
                          <circle cx="80" cy="80" r="70" fill="transparent" 
                                  [attr.stroke]="slice.color" 
                                  stroke-width="14" 
                                  [attr.stroke-dasharray]="slice.dashArray" 
                                  [attr.stroke-dashoffset]="slice.dashOffset"
                                  transform="rotate(-90 80 80)"
                                  style="transition: stroke-dashoffset 0.6s ease;" />
                        }
                        <text x="80" y="85" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-primary)">
                          Category Split
                        </text>
                      </svg>
                    </div>
                    <!-- Legend List -->
                    <div class="legend-list">
                      @for (item of categoriesBreakdown().slice(0, 4); track item.categoryName) {
                        <div class="legend-item">
                          <span class="legend-dot" [style.background-color]="item.color"></span>
                          <span class="legend-name">{{ item.categoryName }}</span>
                          <span class="legend-val">{{ item.percentage / 100 | percent:'1.0-0' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Monthly Trend -->
              <div class="card chart-card">
                <span class="card-title">6-Month Trend</span>
                @if (monthlyTrend().length === 0) {
                  <div class="empty-chart">
                    <p>Loading monthly trend...</p>
                  </div>
                } @else {
                  <div class="trend-chart-container">
                    <div class="trend-bars-y-axis">
                      <span>Max</span>
                      <span>Min</span>
                    </div>
                    <div class="trend-bars">
                      @for (month of monthlyTrend(); track month.monthName) {
                        <div class="trend-bar-group">
                          <div class="trend-bar-split">
                            <!-- Income Bar -->
                            <div class="t-bar income-bar" 
                                 [style.height.%]="getTrendHeightPercent(month.totalIncome)"
                                 [title]="'Income: ' + (month.totalIncome | currency)"></div>
                            <!-- Expense Bar -->
                            <div class="t-bar expense-bar" 
                                 [style.height.%]="getTrendHeightPercent(month.totalExpense)"
                                 [title]="'Expense: ' + (month.totalExpense | currency)"></div>
                          </div>
                          <span class="trend-bar-label">{{ month.monthName }}</span>
                        </div>
                      }
                    </div>
                  </div>
                  <div class="trend-legend">
                    <div class="t-leg-item"><span class="legend-dot bg-green"></span> Income</div>
                    <div class="t-leg-item"><span class="legend-dot bg-black"></span> Expense</div>
                  </div>
                }
              </div>
            </div>

            <!-- Recent Transactions Table -->
            <div class="card" style="margin-top: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span class="card-title" style="margin-bottom: 0;">Recent Transactions</span>
                <a routerLink="/transactions" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-decoration: underline;">View All</a>
              </div>
              @if (recentTransactions().length === 0) {
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.95rem;">
                  No transactions added yet. Let's add some!
                </div>
              } @else {
                <div class="table-container" style="margin-top: 0;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Note</th>
                        <th>Type</th>
                        <th style="text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (t of recentTransactions(); track t.id) {
                        <tr>
                          <td>{{ t.transactionDate | date:'mediumDate' }}</td>
                          <td>
                            @if (t.category) {
                              <span class="cat-pill" [style.background-color]="t.category.color + '15'" [style.color]="t.category.color">
                                <span class="cat-pill-icon">{{ t.category.icon || '🏷️' }}</span>
                                {{ t.category.name }}
                              </span>
                            } @else {
                              <span class="cat-pill bg-gray">Uncategorized</span>
                            }
                          </td>
                          <td style="font-weight: 500;">{{ t.note || '-' }}</td>
                          <td>
                            <span class="badge" [class]="t.type === 'INCOME' ? 'badge-success' : 'badge-danger'">
                              {{ t.type }}
                            </span>
                          </td>
                          <td style="text-align: right; font-weight: 700;" [class.text-green]="t.type === 'INCOME'" [class.text-red]="t.type === 'EXPENSE'">
                            {{ t.type === 'INCOME' ? '+' : '-' }}{{ t.amount | currency }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>

          <!-- Column 2: Budget Risk Widget -->
          <div class="dashboard-side-col">
            <div class="card" style="height: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <span class="card-title" style="margin-bottom: 0;">Budget Tracking</span>
                <a routerLink="/budgets" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-decoration: underline;">Manage</a>
              </div>
              @if (budgets().length === 0) {
                <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary); font-size: 0.95rem;">
                  No active budget limits configured for this month. 
                  <a routerLink="/budgets" style="font-weight: 600; color: var(--accent); text-decoration: underline; display: block; margin-top: 0.5rem;">Set up Budgets</a>
                </div>
              } @else {
                <div class="budget-widget-list">
                  @for (b of budgets(); track b.id) {
                    <div class="budget-widget-item">
                      <div class="budget-w-header">
                        <span style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
                          <span [style.color]="b.categoryColor">{{ b.categoryIcon || '🏷️' }}</span>
                          {{ b.categoryName }}
                        </span>
                        <span class="badge" [class]="getRiskBadgeClass(b.riskStatus)">{{ b.riskStatus }}</span>
                      </div>
                      <div class="budget-w-bar-container">
                        <div class="budget-w-bar" 
                             [style.width.%]="getBudgetPercent(b.usedAmount, b.monthlyLimit)"
                             [class.over]="b.usedAmount > b.monthlyLimit"
                             [class.warn]="b.usedAmount > b.monthlyLimit * 0.7 && b.usedAmount <= b.monthlyLimit"></div>
                      </div>
                      <div class="budget-w-footer">
                        <span>{{ b.usedAmount | currency }} used</span>
                        <span>{{ b.monthlyLimit | currency }} limit</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </section>
      </main>

      <!-- Quick Add Transaction Modal -->
      @if (showQuickAddModal()) {
        <div class="modal-overlay">
          <div class="modal-content fade-in">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; letter-spacing: -0.02em;">Quick Add Transaction</h3>
            
            @if (modalError()) {
              <div class="badge badge-danger" style="display: block; width: 100%; padding: 0.7rem; margin-bottom: 1rem; text-align: center;">
                {{ modalError() }}
              </div>
            }

            <form (submit)="saveQuickTransaction()">
              <div class="form-group">
                <label class="form-label">Type</label>
                <div style="display: flex; gap: 1rem;">
                  <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer;">
                    <input type="radio" name="modalType" value="EXPENSE" [(ngModel)]="modalType" /> Expense
                  </label>
                  <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer;">
                    <input type="radio" name="modalType" value="INCOME" [(ngModel)]="modalType" /> Income
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="modalAmount">Amount (₹)</label>
                <input type="number" step="0.01" id="modalAmount" name="modalAmount" class="input-field" [(ngModel)]="modalAmount" placeholder="0.00" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="modalCategory">Category</label>
                <select id="modalCategory" name="modalCategory" class="input-field select-field" [(ngModel)]="modalCategoryId">
                  <option [value]="null">Select Category (Optional)</option>
                  @for (cat of userCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="modalDate">Transaction Date</label>
                <input type="date" id="modalDate" name="modalDate" class="input-field" [(ngModel)]="modalDate" required />
              </div>

              <div class="form-group" style="margin-bottom: 2rem;">
                <label class="form-label" for="modalNote">Note</label>
                <input type="text" id="modalNote" name="modalNote" class="input-field" [(ngModel)]="modalNote" placeholder="e.g. Lunch with friends" />
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" (click)="closeQuickAdd()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 1000px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }

    .summary-val {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.25rem;
    }

    .summary-val.negative { color: var(--accent-danger); }
    .summary-val.positive { color: var(--accent-success); }
    .summary-val.accent-col { color: var(--accent); }

    .summary-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .dashboard-body-grid {
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 1050px) {
      .dashboard-body-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Charts Layout styling */
    .charts-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 700px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      min-height: 250px;
    }

    .empty-chart {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 160px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    /* Donut Chart legend */
    .category-chart-container {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .svg-container {
      position: relative;
      display: flex;
      justify-content: center;
    }

    .legend-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .legend-name {
      color: var(--text-secondary);
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90px;
    }

    .legend-val {
      font-weight: 600;
    }

    /* Trend Bar Chart Styles */
    .trend-chart-container {
      display: flex;
      height: 150px;
      gap: 0.75rem;
      margin-top: 1rem;
      position: relative;
    }

    .trend-bars-y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 120px;
      font-size: 0.7rem;
      color: var(--text-muted);
      text-align: right;
      width: 25px;
      border-right: 1px solid var(--border-color);
      padding-right: 0.4rem;
    }

    .trend-bars {
      display: flex;
      flex: 1;
      justify-content: space-around;
      align-items: flex-end;
      height: 120px;
    }

    .trend-bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 12%;
      height: 100%;
      justify-content: flex-end;
    }

    .trend-bar-split {
      display: flex;
      gap: 4px;
      width: 100%;
      height: 100%;
      align-items: flex-end;
      justify-content: center;
    }

    .t-bar {
      width: 8px;
      border-radius: 2px;
      transition: height 0.3s ease;
    }

    .income-bar {
      background-color: var(--accent-success);
    }

    .expense-bar {
      background-color: var(--accent);
    }

    .trend-bar-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .trend-legend {
      display: flex;
      justify-content: center;
      gap: 1rem;
      font-size: 0.8rem;
      margin-top: 1rem;
    }

    .t-leg-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--text-secondary);
    }

    .bg-green { background-color: var(--accent-success); }
    .bg-black { background-color: var(--accent); }

    /* Recent Transactions Pilling */
    .cat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .cat-pill-icon {
      font-size: 0.85rem;
    }
    .cat-pill.bg-gray {
      background-color: #f1f5f9;
      color: #64748b;
    }

    .text-green { color: var(--accent-success); }
    .text-red { color: var(--accent-danger); }

    /* Budget Widget side col list */
    .budget-widget-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .budget-widget-item {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .budget-w-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-w-bar-container {
      height: 6px;
      background-color: var(--accent-light);
      border-radius: 3px;
      overflow: hidden;
      width: 100%;
    }

    .budget-w-bar {
      height: 100%;
      background-color: var(--accent-success);
      border-radius: 3px;
    }

    .budget-w-bar.warn {
      background-color: var(--accent-warning);
    }

    .budget-w-bar.over {
      background-color: var(--accent-danger);
    }

    .budget-w-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .ai-card-summary {
      background-color: #f8fafc;
      transition: none;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private financeService = inject(FinanceService);

  userName = signal('User');
  summary = signal({ totalIncome: 0, totalExpense: 0, balance: 0, savingsRate: 0 });
  recentTransactions = signal<any[]>([]);
  budgets = signal<any[]>([]);
  categoriesBreakdown = signal<any[]>([]);
  monthlyTrend = signal<any[]>([]);
  userCategories = signal<any[]>([]);

  aiInsightText = signal('');
  aiInsightMood = signal('stable');

  // Quick Add Modal states
  showQuickAddModal = signal(false);
  modalType = 'EXPENSE';
  modalAmount: number | null = null;
  modalCategoryId: number | null = null;
  modalDate = new Date().toISOString().split('T')[0];
  modalNote = '';
  modalError = signal('');

  svgSlices = signal<any[]>([]);

  ngOnInit() {
    this.loadUserData();
    this.fetchData();
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName.set(user.name);
    }
  }

  fetchData() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    this.financeService.getDashboardSummary(currentMonth, currentYear).subscribe({
      next: (data) => this.summary.set(data),
      error: (e) => console.error(e)
    });

    this.financeService.getRecentTransactions().subscribe({
      next: (data) => this.recentTransactions.set(data),
      error: (e) => console.error(e)
    });

    this.financeService.getBudgets(currentMonth, currentYear).subscribe({
      next: (data) => this.budgets.set(data.slice(0, 5)), // Show top 5 on sidebar widget
      error: (e) => console.error(e)
    });

    this.financeService.getCategoryBreakdown(currentMonth, currentYear).subscribe({
      next: (data) => {
        this.categoriesBreakdown.set(data);
        this.generateSvgSlices(data);
      },
      error: (e) => console.error(e)
    });

    this.financeService.getMonthlyTrend().subscribe({
      next: (data) => this.monthlyTrend.set(data),
      error: (e) => console.error(e)
    });

    this.financeService.getCategories().subscribe({
      next: (data) => this.userCategories.set(data),
      error: (e) => console.error(e)
    });

    this.financeService.getAiInsights(currentMonth, currentYear).subscribe({
      next: (data) => {
        if (data && data.insightText) {
          try {
            const parsed = JSON.parse(data.insightText);
            this.aiInsightText.set(parsed.moneyStory);
            this.aiInsightMood.set(data.moodStatus || parsed.mood || 'stable');
          } catch {
            this.aiInsightText.set(data.insightText);
            this.aiInsightMood.set(data.moodStatus || 'stable');
          }
        }
      },
      error: (e) => console.error(e)
    });
  }

  // Visual SVG Chart Slice Generation
  generateSvgSlices(breakdown: any[]) {
    let accumulatedPercent = 0;
    const slices = [];
    // Circumference of our SVG circle is 2 * PI * r = 2 * 3.14159 * 70 = 439.8
    const circumference = 439.8;

    for (const item of breakdown) {
      const percentage = item.percentage;
      const strokeLength = (percentage / 100) * circumference;
      const strokeOffset = circumference - strokeLength;
      
      // Calculate rotation dash-offset dynamically based on accumulated percentage
      const dashOffset = circumference - strokeLength + ((accumulatedPercent / 100) * circumference);

      slices.push({
        categoryName: item.categoryName,
        color: item.color,
        dashArray: `${strokeLength} ${circumference}`,
        dashOffset: -((accumulatedPercent / 100) * circumference)
      });
      accumulatedPercent += percentage;
    }

    this.svgSlices.set(slices);
  }

  getTrendHeightPercent(amount: number): number {
    const maxVal = Math.max(
      ...this.monthlyTrend().map(m => Math.max(m.totalIncome, m.totalExpense)),
      1000 // Avoid division by zero
    );
    return (amount / maxVal) * 100;
  }

  getBudgetPercent(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min((used / limit) * 100, 100);
  }

  getMoodBadgeClass(mood: string): string {
    switch (mood?.toLowerCase()) {
      case 'strong': return 'badge-success';
      case 'warning': return 'badge-danger';
      default: return 'badge-warning';
    }
  }

  getRiskBadgeClass(status: string): string {
    switch (status) {
      case 'OVERSPENDING': return 'badge-danger';
      case 'WATCHFUL': return 'badge-warning';
      default: return 'badge-success';
    }
  }

  // Quick Add handlers
  openQuickAdd() {
    this.modalError.set('');
    this.modalAmount = null;
    this.modalCategoryId = null;
    this.modalNote = '';
    this.modalDate = new Date().toISOString().split('T')[0];
    this.showQuickAddModal.set(true);
  }

  closeQuickAdd() {
    this.showQuickAddModal.set(false);
  }

  saveQuickTransaction() {
    if (!this.modalAmount || this.modalAmount <= 0) {
      this.modalError.set('Please enter a valid amount.');
      return;
    }

    const payload = {
      amount: this.modalAmount,
      type: this.modalType,
      categoryId: this.modalCategoryId ? Number(this.modalCategoryId) : null,
      transactionDate: this.modalDate,
      note: this.modalNote
    };

    this.financeService.createTransaction(payload).subscribe({
      next: () => {
        this.closeQuickAdd();
        this.fetchData(); // Refresh all aggregates
      },
      error: (err) => {
        this.modalError.set(err.error?.message || 'Failed to save transaction.');
      }
    });
  }
}
