import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'register',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'forgot-password',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'reset-password/:token',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./components/tasks/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./components/tasks/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./components/tasks/task-detail/task-detail.component').then(
        (m) => m.TaskDetailComponent
      ),
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () =>
      import('./components/tasks/task-edit/task-edit.component').then(
        (m) => m.TaskEditComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users/users-list/users-list.component').then(
        (m) => m.UsersListComponent
      ),
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('./components/organizations/organization-list/organization-list.component').then(
        (m) => m.OrganizationListComponent
      ),
  },
  {
    path: 'organizations/new',
    loadComponent: () =>
      import('./components/organizations/organization-form/organization-form.component').then(
        (m) => m.OrganizationFormComponent
      ),
  },
  {
    path: 'organizations/:id',
    loadComponent: () =>
      import('./components/organizations/organization-detail/organization-detail.component').then(
        (m) => m.OrganizationDetailComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

