import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { DemoDataService } from './demo-data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private demoData = inject(DemoDataService);

  constructor() {
    this.ensureDemoSession();
  }

  redirectToTasks() {
    this.router.navigate(['/tasks']);
  }

  register(user: any): Observable<any> {
    this.ensureDemoSession();
    return of({
      status: 'success',
      message: 'Demo registration complete',
      token: 'demo-token',
      expiresIn: 86400,
      user: {
        role: this.getCurrentUserRole(),
        organization: user?.organization || 'TaskFlow Studio',
      },
    });
  }

  login(_: any): Observable<any> {
    this.ensureDemoSession();
    return of({
      status: 'success',
      message: 'Demo login complete',
      token: 'demo-token',
      expiresIn: 86400,
      user: {
        role: this.getCurrentUserRole(),
        organization: 'TaskFlow Studio',
      },
    });
  }

  isAuthenticated(): boolean {
    return true;
  }

  isAdmin(): boolean {
    return true;
  }

  isSuper(): boolean {
    return true;
  }

  getToken(): string | null {
    return 'demo-token';
  }

  getCurrentUserRole(): string {
    return this.demoData.getCurrentUserRole();
  }

  logout() {
    this.ensureDemoSession();
    this.router.navigate(['/tasks']);
  }

  forgotPassword(email: string): Observable<any> {
    return of({
      status: 'success',
      message: `Password reset is disabled in demo mode for ${email}.`,
    });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return of({
      status: 'success',
      message: `Password reset is disabled in demo mode for token ${token}.`,
      data: { passwordLength: password?.length || 0 },
    });
  }

  autoLogin() {
    this.ensureDemoSession();
  }

  autoLogout(_: number) {}

  getCurrentUserId(): string {
    return this.demoData.getCurrentUserId();
  }

  getCurrentUser(): any {
    return this.demoData.getProfile();
  }

  saveUserData(_: any): void {
    this.ensureDemoSession();
  }

  private ensureDemoSession() {
    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.setItem('token', 'demo-token');
    sessionStorage.setItem('role', this.getCurrentUserRole());
    sessionStorage.setItem(
      'user',
      JSON.stringify(this.demoData.getProfile())
    );
    sessionStorage.setItem(
      'organization',
      JSON.stringify(this.demoData.getProfile().organization || {})
    );
    sessionStorage.setItem(
      'tokenExpirationDate',
      new Date(Date.now() + 86400 * 1000).toISOString()
    );
  }
}
