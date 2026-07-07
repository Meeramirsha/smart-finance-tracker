import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://smart-finance-tracker-cq0m.onrender.com/api'; // Replace this with your backend URL once you host it (e.g. on Render)

  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.userSubject.next(JSON.parse(userStr));
    }
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify({ id: res.id, name: res.name, email: res.email }));
          this.userSubject.next({ id: res.id, name: res.name, email: res.email });
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  // Categories API
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`, { headers: this.getHeaders() });
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, category, { headers: this.getHeaders() });
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, category, { headers: this.getHeaders() });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  // Transactions API
  getTransactions(paramsObj: any): Observable<any> {
    let params = new HttpParams();
    if (paramsObj.type) params = params.set('type', paramsObj.type);
    if (paramsObj.categoryId) params = params.set('categoryId', paramsObj.categoryId);
    if (paramsObj.startDate) params = params.set('startDate', paramsObj.startDate);
    if (paramsObj.endDate) params = params.set('endDate', paramsObj.endDate);
    if (paramsObj.search) params = params.set('search', paramsObj.search);
    if (paramsObj.page !== undefined) params = params.set('page', paramsObj.page);
    if (paramsObj.size !== undefined) params = params.set('size', paramsObj.size);
    if (paramsObj.sortBy) params = params.set('sortBy', paramsObj.sortBy);
    if (paramsObj.direction) params = params.set('direction', paramsObj.direction);

    return this.http.get<any>(`${this.apiUrl}/transactions`, { headers: this.getHeaders(), params });
  }

  createTransaction(transaction: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions`, transaction, { headers: this.getHeaders() });
  }

  updateTransaction(id: number, transaction: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/transactions/${id}`, transaction, { headers: this.getHeaders() });
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transactions/${id}`, { headers: this.getHeaders() });
  }

  // Budgets API
  getBudgets(month?: number, year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month);
    if (year !== undefined) params = params.set('year', year);

    return this.http.get<any[]>(`${this.apiUrl}/budgets`, { headers: this.getHeaders(), params });
  }

  createOrUpdateBudget(budget: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/budgets`, budget, { headers: this.getHeaders() });
  }

  deleteBudget(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/budgets/${id}`, { headers: this.getHeaders() });
  }

  // Dashboard API
  getDashboardSummary(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month);
    if (year !== undefined) params = params.set('year', year);

    return this.http.get<any>(`${this.apiUrl}/dashboard/summary`, { headers: this.getHeaders(), params });
  }

  getCategoryBreakdown(month?: number, year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month);
    if (year !== undefined) params = params.set('year', year);

    return this.http.get<any[]>(`${this.apiUrl}/dashboard/category-breakdown`, { headers: this.getHeaders(), params });
  }

  getMonthlyTrend(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/monthly-trend`, { headers: this.getHeaders() });
  }

  getRecentTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/recent-transactions`, { headers: this.getHeaders() });
  }

  // AI API
  getAiInsights(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month);
    if (year !== undefined) params = params.set('year', year);

    return this.http.get<any>(`${this.apiUrl}/ai/insights`, { headers: this.getHeaders(), params });
  }

  generateAiInsight(month: number, year: number): Observable<any> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.post(`${this.apiUrl}/ai/generate-insight`, null, { headers: this.getHeaders(), params });
  }
}
