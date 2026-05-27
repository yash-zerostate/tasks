import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Organizations, SingleOrganization } from '../core/models/organization.model';
import { DemoDataService } from './demo-data.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private demoData = inject(DemoDataService);

  getMyOrganizations(page: number, limit: number): Observable<any> {
    const paginated = this.paginate(this.demoData.getOrganizations(), page, limit);
    const organization = paginated.items[0] || null;

    return of({
      status: 'success',
      message: 'Organizations fetched from demo data',
      organization,
      data: {
        organization,
        organizations: paginated.items,
        totalOrganizations: paginated.total,
        totalPages: paginated.totalPages,
        currentPage: paginated.currentPage,
      },
    });
  }

  getAllOrganizations(page: number, limit: number): Observable<Organizations> {
    const paginated = this.paginate(this.demoData.getOrganizations(), page, limit);
    return of({
      status: 'success',
      message: 'Organizations fetched from demo data',
      data: {
        organizations: paginated.items,
        totalOrganizations: paginated.total,
        totalPages: paginated.totalPages,
        currentPage: paginated.currentPage,
      },
    });
  }

  getOrganizationById(id: string): Observable<SingleOrganization> {
    return of({
      status: 'success',
      message: 'Organization fetched from demo data',
      data: this.demoData.getOrganizationById(id)!,
    });
  }

  createOrganization(organization: any): Observable<any> {
    return of({
      status: 'success',
      message: 'Organization created in demo mode',
      data: this.demoData.createOrganization(organization),
    });
  }

  updateOrganization(id: string, organization: any): Observable<any> {
    return of({
      status: 'success',
      message: 'Organization updated in demo mode',
      data: this.demoData.updateOrganization(id, organization),
    });
  }

  addMember(organizationId: string, userId: string, role: string): Observable<any> {
    return of({
      status: 'success',
      message: 'Member added in demo mode',
      data: this.demoData.addMember(
        organizationId,
        userId,
        role as 'admin' | 'member'
      ),
    });
  }

  removeMember(organizationId: string, userId: string): Observable<any> {
    return of({
      status: 'success',
      message: 'Member removed in demo mode',
      data: this.demoData.removeMember(organizationId, userId),
    });
  }

  deleteOrganization(id: string): Observable<any> {
    this.demoData.deleteOrganization(id);
    return of({
      status: 'success',
      message: 'Organization deleted in demo mode',
    });
  }

  private paginate<T>(items: T[], page: number, limit: number) {
    const safeLimit = Math.max(limit, 1);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * safeLimit;

    return {
      items: items.slice(start, start + safeLimit),
      total,
      totalPages,
      currentPage,
    };
  }
}
