import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DemoDataService } from './demo-data.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private demoData = inject(DemoDataService);

  getUsers(): Observable<any> {
    const users = this.demoData.getOrganizationUsers();
    return of(this.buildUsersResponse(users, 1, users.length || 10));
  }

  getUsersByOrganization(page: number = 1, limit: number = 100): Observable<any> {
    const users = this.demoData.getOrganizationUsers();
    return of(this.buildUsersResponse(users, page, limit));
  }

  getAllUsers(page: number = 1, limit: number = 100): Observable<any> {
    const users = this.demoData.getOrganizations().length
      ? this.demoData.getOrganizationUsers().concat(
          this.demoData
            .getTasks()
            .map((task) => task.user)
            .filter((user): user is any => typeof user !== 'string')
        )
      : this.demoData.getOrganizationUsers();

    const deduped = Array.from(
      new Map(users.map((user) => [user._id, user])).values()
    );

    return of(this.buildUsersResponse(deduped, page, limit));
  }

  getProfile(): Observable<any> {
    return of({
      status: 'success',
      message: 'Profile fetched from demo data',
      data: this.demoData.getProfile(),
    });
  }

  private buildUsersResponse(users: any[], page: number, limit: number) {
    const safeLimit = Math.max(limit, 1);
    const totalUsers = users.length;
    const totalPages = Math.max(1, Math.ceil(totalUsers / safeLimit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * safeLimit;

    return {
      status: 'success',
      message: 'Users fetched from demo data',
      data: {
        users: users.slice(start, start + safeLimit),
        totalUsers,
        totalPages,
        currentPage,
      },
    };
  }
}
