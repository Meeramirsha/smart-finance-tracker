import { Routes } from '@angular/router';
import { LandingComponent } from './landing';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { DashboardComponent } from './dashboard';
import { TransactionsComponent } from './transactions';
import { BudgetsComponent } from './budgets';
import { CategoriesComponent } from './categories';
import { InsightsComponent } from './insights';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'insights', component: InsightsComponent },
  { path: '**', redirectTo: '' }
];
