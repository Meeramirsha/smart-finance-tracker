import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';
import { SidebarComponent } from './sidebar';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  template: `
    <div class="app-container fade-in">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <header class="header-section">
          <div class="header-title">
            <h1>Categories</h1>
            <p>Organize your transactions with labels, colors, and icons.</p>
          </div>
          <div class="header-actions">
            <button (click)="openAddModal()" class="btn btn-primary">
              <span>+</span> Add Custom Category
            </button>
          </div>
        </header>

        <!-- Student Preset Helper Section -->
        @if (categories().length === 0) {
          <section class="card preset-helper-card" style="margin-bottom: 2.5rem; background-color: var(--accent-light); border-color: #cbd5e1; padding: 2rem;">
            <div style="max-width: 600px;">
              <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em;">Get Started with Presets</h2>
              <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5;">
                We have crafted high-frequency category presets specifically for students and freshers. Load them with a single click to start tracking immediately.
              </p>
              <button (click)="loadPresets()" class="btn btn-primary" [disabled]="isLoadingPresets()">
                {{ isLoadingPresets() ? 'Adding Presets...' : '✦ Install Student/Fresher Presets' }}
              </button>
            </div>
          </section>
        }

        <!-- Custom Categories Grid -->
        <section>
          @if (categories().length === 0) {
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
              No custom categories created yet. Load presets above or create a custom one!
            </div>
          } @else {
            <div class="categories-grid">
              @for (c of categories(); track c.id) {
                <div class="card category-card" [style.border-left]="'4px solid ' + c.color">
                  <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="cat-icon-container" [style.background-color]="c.color + '15'" [style.color]="c.color">
                      {{ c.icon || '🏷️' }}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                      <span style="font-weight: 700; font-size: 1.05rem;">{{ c.name }}</span>
                      <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-secondary);">
                        {{ c.color }}
                      </span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <button (click)="openEditModal(c)" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Edit</button>
                    <button (click)="deleteCategory(c.id)" class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Delete</button>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </main>

      <!-- Category Modal -->
      @if (showModal()) {
        <div class="modal-overlay">
          <div class="modal-content fade-in">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; letter-spacing: -0.02em;">
              {{ isEditMode() ? 'Edit Category' : 'Create Category' }}
            </h3>

            @if (modalError()) {
              <div class="badge badge-danger" style="display: block; width: 100%; padding: 0.7rem; margin-bottom: 1rem; text-align: center;">
                {{ modalError() }}
              </div>
            }

            <form (submit)="saveCategory()">
              <div class="form-group">
                <label class="form-label" for="modalName">Category Name</label>
                <input type="text" id="modalName" name="modalName" class="input-field" [(ngModel)]="modalName" placeholder="e.g. Subscriptions" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="modalIcon">Icon (Emoji)</label>
                <input type="text" id="modalIcon" name="modalIcon" class="input-field" [(ngModel)]="modalIcon" placeholder="e.g. 🍿" maxlength="2" required />
              </div>

              <div class="form-group" style="margin-bottom: 2rem;">
                <label class="form-label" for="modalColor">Color (Hex)</label>
                <div style="display: flex; gap: 0.75rem;">
                  <input type="color" id="modalColorPick" name="modalColorPick" [(ngModel)]="modalColor" style="width: 40px; height: 40px; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; padding: 0;" />
                  <input type="text" id="modalColor" name="modalColor" class="input-field" [(ngModel)]="modalColor" placeholder="#000000" pattern="^#([A-Fa-f0-9]{6})$" required />
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .categories-grid {
        grid-template-columns: 1fr;
      }
    }

    .category-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
    }

    .cat-icon-container {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }

    .card-actions {
      display: flex;
      gap: 0.4rem;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  private financeService = inject(FinanceService);

  categories = signal<any[]>([]);
  isLoadingPresets = signal(false);

  // Modal models
  showModal = signal(false);
  isEditMode = signal(false);
  selectedCategoryId: number | null = null;
  modalName = '';
  modalIcon = '';
  modalColor = '#0f172a';
  modalError = signal('');

  // Preset list for students & freshers
  studentPresets = [
    { name: 'Study Supplies', icon: '📚', color: '#3b82f6' },
    { name: 'Dining Out', icon: '🍔', color: '#f59e0b' },
    { name: 'Social & Fun', icon: '🎉', color: '#ec4899' },
    { name: 'Rent & Housing', icon: '🏠', color: '#10b981' },
    { name: 'Transport & Commute', icon: '🚌', color: '#6366f1' }
  ];

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.financeService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (e) => console.error(e)
    });
  }

  loadPresets() {
    this.isLoadingPresets.set(true);
    let completedCount = 0;

    // Sequential API calls to create categories
    const createNextPreset = (index: number) => {
      if (index >= this.studentPresets.length) {
        this.isLoadingPresets.set(false);
        this.fetchCategories();
        return;
      }

      this.financeService.createCategory(this.studentPresets[index]).subscribe({
        next: () => createNextPreset(index + 1),
        error: () => createNextPreset(index + 1)
      });
    };

    createNextPreset(0);
  }

  // Modal handlers
  openAddModal() {
    this.isEditMode.set(false);
    this.selectedCategoryId = null;
    this.modalError.set('');
    this.modalName = '';
    this.modalIcon = '';
    this.modalColor = '#0f172a';
    this.showModal.set(true);
  }

  openEditModal(category: any) {
    this.isEditMode.set(true);
    this.selectedCategoryId = category.id;
    this.modalError.set('');
    this.modalName = category.name;
    this.modalIcon = category.icon;
    this.modalColor = category.color || '#0f172a';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    if (!this.modalName || !this.modalIcon || !this.modalColor) {
      this.modalError.set('Please fill out all fields.');
      return;
    }

    const payload = {
      name: this.modalName,
      icon: this.modalIcon,
      color: this.modalColor
    };

    if (this.isEditMode()) {
      this.financeService.updateCategory(this.selectedCategoryId!, payload).subscribe({
        next: () => {
          this.closeModal();
          this.fetchCategories();
        },
        error: (err) => this.modalError.set(err.error?.message || 'Failed to update category.')
      });
    } else {
      this.financeService.createCategory(payload).subscribe({
        next: () => {
          this.closeModal();
          this.fetchCategories();
        },
        error: (err) => this.modalError.set(err.error?.message || 'Failed to create category.')
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category? All transactions in this category will be marked uncategorized.')) {
      this.financeService.deleteCategory(id).subscribe({
        next: () => this.fetchCategories(),
        error: (e) => console.error(e)
      });
    }
  }
}
