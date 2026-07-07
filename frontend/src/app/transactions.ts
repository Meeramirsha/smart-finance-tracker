import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';
import { SidebarComponent } from './sidebar';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [SidebarComponent, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="app-container fade-in">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <header class="header-section">
          <div class="header-title">
            <h1>Transactions</h1>
            <p>Track, filter, and manage your income and expenses.</p>
          </div>
          <div class="header-actions">
            <button (click)="openAddModal()" class="btn btn-primary">
              <span>+</span> Add Transaction
            </button>
          </div>
        </header>

        <!-- Filters Section -->
        <section class="card filters-card" style="margin-bottom: 2rem;">
          <div class="filters-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Search Note</label>
              <input type="text" [(ngModel)]="filterSearch" (input)="onFilterChange()" class="input-field" placeholder="Search note..." />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Type</label>
              <select [(ngModel)]="filterType" (change)="onFilterChange()" class="input-field select-field">
                <option value="">All Types</option>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Category</label>
              <select [(ngModel)]="filterCategoryId" (change)="onFilterChange()" class="input-field select-field">
                <option [value]="null">All Categories</option>
                @for (cat of userCategories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Start Date</label>
              <input type="date" [(ngModel)]="filterStartDate" (change)="onFilterChange()" class="input-field" />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">End Date</label>
              <input type="date" [(ngModel)]="filterEndDate" (change)="onFilterChange()" class="input-field" />
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 1rem; gap: 0.5rem;">
            <button (click)="clearFilters()" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Clear Filters</button>
          </div>
        </section>

        <!-- Transactions List -->
        <section class="card">
          @if (transactions().length === 0) {
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
              No transactions match your filter criteria.
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
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of transactions(); track t.id) {
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
                      <td style="text-align: right;">
                        <button (click)="openEditModal(t)" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-right: 0.4rem;">
                          Edit
                        </button>
                        <button (click)="deleteTransaction(t.id)" class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                          Delete
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination Control -->
            <div class="pagination-container">
              <span style="font-size: 0.9rem; color: var(--text-secondary);">
                Page {{ currentPage() + 1 }} of {{ totalPages() }}
              </span>
              <div style="display: flex; gap: 0.5rem;">
                <button (click)="setPage(currentPage() - 1)" [disabled]="currentPage() === 0" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                  Previous
                </button>
                <button (click)="setPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages() - 1" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                  Next
                </button>
              </div>
            </div>
          }
        </section>
      </main>

      <!-- Add/Edit Transaction Modal -->
      @if (showModal()) {
        <div class="modal-overlay">
          <div class="modal-content fade-in">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; letter-spacing: -0.02em;">
              {{ isEditMode() ? 'Edit Transaction' : 'Add Transaction' }}
            </h3>

            @if (modalError()) {
              <div class="badge badge-danger" style="display: block; width: 100%; padding: 0.7rem; margin-bottom: 1rem; text-align: center;">
                {{ modalError() }}
              </div>
            }

            <form (submit)="saveTransaction()">
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
                <input type="text" id="modalNote" name="modalNote" class="input-field" [(ngModel)]="modalNote" placeholder="e.g. Weekly grocery trip" />
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
    }

    @media (max-width: 1000px) {
      .filters-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 700px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
    }

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
  `]
})
export class TransactionsComponent implements OnInit {
  private financeService = inject(FinanceService);

  transactions = signal<any[]>([]);
  userCategories = signal<any[]>([]);
  
  // Pagination
  currentPage = signal(0);
  totalPages = signal(1);
  pageSize = 10;

  // Filter models
  filterSearch = '';
  filterType = '';
  filterCategoryId: number | null = null;
  filterStartDate = '';
  filterEndDate = '';

  // Modal models
  showModal = signal(false);
  isEditMode = signal(false);
  selectedTransactionId: number | null = null;
  modalType = 'EXPENSE';
  modalAmount: number | null = null;
  modalCategoryId: number | null = null;
  modalDate = '';
  modalNote = '';
  modalError = signal('');

  ngOnInit() {
    this.fetchTransactions();
    this.fetchCategories();
  }

  fetchTransactions() {
    const filters = {
      search: this.filterSearch,
      type: this.filterType,
      categoryId: this.filterCategoryId,
      startDate: this.filterStartDate || null,
      endDate: this.filterEndDate || null,
      page: this.currentPage(),
      size: this.pageSize,
      sortBy: 'transactionDate',
      direction: 'desc'
    };

    this.financeService.getTransactions(filters).subscribe({
      next: (res) => {
        this.transactions.set(res.content);
        this.totalPages.set(res.totalPages);
      },
      error: (e) => console.error(e)
    });
  }

  fetchCategories() {
    this.financeService.getCategories().subscribe({
      next: (data) => this.userCategories.set(data),
      error: (e) => console.error(e)
    });
  }

  onFilterChange() {
    this.currentPage.set(0); // Reset page on filters change
    this.fetchTransactions();
  }

  clearFilters() {
    this.filterSearch = '';
    this.filterType = '';
    this.filterCategoryId = null;
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.currentPage.set(0);
    this.fetchTransactions();
  }

  setPage(pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.currentPage.set(pageIndex);
      this.fetchTransactions();
    }
  }

  // Modal Actions
  openAddModal() {
    this.isEditMode.set(false);
    this.selectedTransactionId = null;
    this.modalError.set('');
    this.modalType = 'EXPENSE';
    this.modalAmount = null;
    this.modalCategoryId = null;
    this.modalNote = '';
    this.modalDate = new Date().toISOString().split('T')[0];
    this.showModal.set(true);
  }

  openEditModal(transaction: any) {
    this.isEditMode.set(true);
    this.selectedTransactionId = transaction.id;
    this.modalError.set('');
    this.modalType = transaction.type;
    this.modalAmount = transaction.amount;
    this.modalCategoryId = transaction.category ? transaction.category.id : null;
    this.modalNote = transaction.note || '';
    this.modalDate = transaction.transactionDate;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveTransaction() {
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

    if (this.isEditMode()) {
      this.financeService.updateTransaction(this.selectedTransactionId!, payload).subscribe({
        next: () => {
          this.closeModal();
          this.fetchTransactions();
        },
        error: (err) => this.modalError.set(err.error?.message || 'Failed to update transaction.')
      });
    } else {
      this.financeService.createTransaction(payload).subscribe({
        next: () => {
          this.closeModal();
          this.fetchTransactions();
        },
        error: (err) => this.modalError.set(err.error?.message || 'Failed to create transaction.')
      });
    }
  }

  deleteTransaction(id: number) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.financeService.deleteTransaction(id).subscribe({
        next: () => this.fetchTransactions(),
        error: (e) => console.error(e)
      });
    }
  }
}
