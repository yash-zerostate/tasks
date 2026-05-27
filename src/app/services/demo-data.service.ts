import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Organization } from '../core/models/organization.model';
import { Task, User as TaskUser, Subtask } from '../core/models/tasks.model';
import { UserItem } from '../core/models/users.model';

type DemoRole = 'user' | 'admin' | 'super';

type DemoActivity = {
  _id: string;
  action: 'created' | 'updated' | 'status_changed' | 'subtask_toggled';
  details: string;
  createdAt: string;
  user: {
    _id: string;
    email: string;
  };
};

type DemoTask = Task;

type DemoStore = {
  currentUserId: string;
  users: UserItem[];
  organizations: Organization[];
  tasks: DemoTask[];
  activities: Record<string, DemoActivity[]>;
  visitorCount: number;
};

@Injectable({
  providedIn: 'root',
})
export class DemoDataService {
  private readonly storageKey = 'task-management-demo-store';

  getCurrentUser() {
    const store = this.readStore();
    return (
      store.users.find((user) => user._id === store.currentUserId) ||
      store.users[0]
    );
  }

  getCurrentUserId() {
    return this.getCurrentUser()._id;
  }

  getCurrentUserRole(): DemoRole {
    return (this.getCurrentUser().role as DemoRole) || 'super';
  }

  isAdmin() {
    return true;
  }

  isSuper() {
    return true;
  }

  getTasks(): DemoTask[] {
    return this.readStore().tasks;
  }

  getTaskById(id: string) {
    return this.getTasks().find((task) => task._id === id) || null;
  }

  createTask(taskInput: any): DemoTask {
    const store = this.readStore();
    const assignedUser = this.findUserById(taskInput.userId, store.users);
    const now = new Date().toISOString();

    const task: DemoTask = {
      _id: this.createId('task'),
      title: taskInput.title,
      description: taskInput.description,
      deadline: taskInput.deadline,
      priority: taskInput.priority,
      completed: false,
      user: assignedUser,
      createdAt: now,
      updatedAt: now,
      subtasks: this.mapSubtasks(taskInput.subtasks),
      __v: 0,
    };

    store.tasks.unshift(task);
    store.activities[task._id] = [
      this.createActivity('created', `Task "${task.title}" was created.`),
    ];
    this.writeStore(store);
    return task;
  }

  updateTask(id: string, updates: any) {
    const store = this.readStore();
    const index = store.tasks.findIndex((task) => task._id === id);

    if (index === -1) {
      return null;
    }

    const existingTask = store.tasks[index];
    const updatedTask: DemoTask = {
      ...existingTask,
      ...updates,
      user: updates.userId
        ? this.findUserById(updates.userId, store.users)
        : existingTask.user,
      subtasks: updates.subtasks
        ? this.mapSubtasks(updates.subtasks)
        : existingTask.subtasks,
      updatedAt: new Date().toISOString(),
    };

    if (typeof updates.completed === 'boolean' && updates.completed !== existingTask.completed) {
      const detail = updates.completed
        ? `Task "${existingTask.title}" was marked as completed.`
        : `Task "${existingTask.title}" was moved back to ongoing.`;
      this.pushActivity(store, id, 'status_changed', detail);
    } else if (updates.subtasks) {
      this.pushActivity(
        store,
        id,
        'subtask_toggled',
        `Subtasks were updated for "${existingTask.title}".`
      );
    } else {
      this.pushActivity(store, id, 'updated', `Task "${existingTask.title}" was updated.`);
    }

    store.tasks[index] = updatedTask;
    this.writeStore(store);
    return updatedTask;
  }

  deleteTask(id: string) {
    const store = this.readStore();
    const task = store.tasks.find((item) => item._id === id) || null;

    if (!task) {
      return null;
    }

    store.tasks = store.tasks.filter((item) => item._id !== id);
    delete store.activities[id];
    this.writeStore(store);
    return task;
  }

  getTaskActivities(id: string) {
    return this.readStore().activities[id] || [];
  }

  getOrganizations() {
    return this.readStore().organizations;
  }

  getOrganizationById(id: string) {
    return this.getOrganizations().find((org) => org._id === id) || null;
  }

  createOrganization(input: any) {
    const store = this.readStore();
    const owner = this.getCurrentUser();
    const now = new Date().toISOString();

    const organization: Organization = {
      _id: this.createId('org'),
      name: input.name,
      description: input.description || '',
      logo: input.logo || '',
      createdAt: now,
      owner: {
        _id: owner._id,
        email: owner.email,
      },
      members: [
        {
          _id: this.createId('member'),
          user: {
            _id: owner._id,
            email: owner.email,
          },
          role: 'admin',
          joinedAt: now,
        },
      ],
    };

    store.organizations.unshift(organization);
    this.writeStore(store);
    return organization;
  }

  updateOrganization(id: string, updates: any) {
    const store = this.readStore();
    const index = store.organizations.findIndex((org) => org._id === id);

    if (index === -1) {
      return null;
    }

    const existingOrg = store.organizations[index];
    const updatedOrg: Organization = {
      ...existingOrg,
      name: updates.name ?? existingOrg.name,
      description: updates.description ?? existingOrg.description,
      logo: updates.logo ?? existingOrg.logo,
    };

    store.organizations[index] = updatedOrg;
    this.writeStore(store);
    return updatedOrg;
  }

  deleteOrganization(id: string) {
    const store = this.readStore();
    store.organizations = store.organizations.filter((org) => org._id !== id);
    this.writeStore(store);
  }

  addMember(organizationId: string, userId: string, role: 'admin' | 'member') {
    const store = this.readStore();
    const organization = store.organizations.find((org) => org._id === organizationId);
    const user = this.findUserById(userId, store.users);

    if (!organization || organization.members.some((member) => member.user._id === userId)) {
      return organization || null;
    }

    organization.members.push({
      _id: this.createId('member'),
      user: {
        _id: user._id,
        email: user.email,
      },
      role,
      joinedAt: new Date().toISOString(),
    });

    this.writeStore(store);
    return organization;
  }

  removeMember(organizationId: string, userId: string) {
    const store = this.readStore();
    const organization = store.organizations.find((org) => org._id === organizationId);

    if (!organization) {
      return null;
    }

    organization.members = organization.members.filter(
      (member) => member.user._id !== userId
    );
    this.writeStore(store);
    return organization;
  }

  getOrganizationUsers() {
    const store = this.readStore();
    const primaryOrg = store.organizations[0];

    if (!primaryOrg) {
      return store.users;
    }

    const memberIds = new Set(primaryOrg.members.map((member) => member.user._id));
    return store.users.filter((user) => memberIds.has(user._id));
  }

  getProfile() {
    const currentUser = this.getCurrentUser();
    const primaryOrg = this.readStore().organizations[0];
    const membership = primaryOrg?.members.find(
      (member) => member.user._id === currentUser._id
    );

    return {
      _id: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
      organization: primaryOrg
        ? {
            _id: primaryOrg._id,
            name: primaryOrg.name,
          }
        : null,
      organizationRole: membership?.role || 'admin',
      joinedAt: primaryOrg?.createdAt || new Date().toISOString(),
    };
  }

  getTaskStats() {
    const tasks = this.getTasks();
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      highPriority: tasks.filter((task) => task.priority === 'High').length,
      mediumPriority: tasks.filter((task) => task.priority === 'Medium').length,
      lowPriority: tasks.filter((task) => task.priority === 'Low').length,
    };
  }

  trackVisit(projectName: string): Observable<{
    message: string;
    projectName: string;
    uniqueVisitors: number;
  }> {
    const store = this.readStore();
    store.visitorCount += 1;
    this.writeStore(store);

    return of({
      message: 'Demo visit tracked',
      projectName,
      uniqueVisitors: store.visitorCount,
    });
  }

  resetDemoData() {
    this.writeStore(this.createSeedStore());
  }

  private readStore(): DemoStore {
    if (typeof window === 'undefined') {
      return this.createSeedStore();
    }

    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      const seed = this.createSeedStore();
      this.writeStore(seed);
      return seed;
    }

    try {
      return JSON.parse(raw) as DemoStore;
    } catch {
      const seed = this.createSeedStore();
      this.writeStore(seed);
      return seed;
    }
  }

  private writeStore(store: DemoStore) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(store));
  }

  private createSeedStore(): DemoStore {
    const users: UserItem[] = [
      { _id: 'user-1', email: 'manthan.demo@taskflow.app', role: 'super', __v: 0 },
      { _id: 'user-2', email: 'sara.ops@taskflow.app', role: 'admin', __v: 0 },
      { _id: 'user-3', email: 'rahul.dev@taskflow.app', role: 'user', __v: 0 },
      { _id: 'user-4', email: 'neha.design@taskflow.app', role: 'user', __v: 0 },
    ];

    const organizations: Organization[] = [
      {
        _id: 'org-1',
        name: 'TaskFlow Studio',
        description: 'Demo workspace for frontend-only testing and extension checks.',
        logo: '',
        createdAt: '2026-05-01T09:00:00.000Z',
        owner: {
          _id: 'user-1',
          email: 'manthan.demo@taskflow.app',
        },
        members: [
          this.createMember('member-1', users[0], 'admin', '2026-05-01T09:00:00.000Z'),
          this.createMember('member-2', users[1], 'admin', '2026-05-02T09:00:00.000Z'),
          this.createMember('member-3', users[2], 'member', '2026-05-03T09:00:00.000Z'),
          this.createMember('member-4', users[3], 'member', '2026-05-04T09:00:00.000Z'),
        ],
      },
    ];

    const taskUsers: TaskUser[] = users.map((user) => ({
      _id: user._id,
      email: user.email,
      role: user.role,
      __v: user.__v,
    }));

    const tasks: DemoTask[] = [
      this.createSeedTask(
        'task-1',
        'Finalize extension demo checklist',
        'Prepare a focused checklist for frontend extension validation and smoke testing.',
        '2026-05-29',
        'High',
        false,
        taskUsers[0],
        [
          { _id: 'sub-1', title: 'Confirm routes load without backend', completed: true },
          { _id: 'sub-2', title: 'Verify local demo data populates all screens', completed: false },
        ],
        '2026-05-20T10:00:00.000Z'
      ),
      this.createSeedTask(
        'task-2',
        'Review dashboard styling polish',
        'Tighten up spacing and hierarchy for the executive dashboard cards.',
        '2026-05-30',
        'Medium',
        false,
        taskUsers[3],
        [
          { _id: 'sub-3', title: 'Refine card spacing', completed: true },
          { _id: 'sub-4', title: 'Adjust mobile typography', completed: true },
        ],
        '2026-05-18T11:00:00.000Z'
      ),
      this.createSeedTask(
        'task-3',
        'Ship onboarding empty states',
        'Add empty-state copy and illustrations for first-time visitors.',
        '2026-05-24',
        'Low',
        true,
        taskUsers[1],
        [
          { _id: 'sub-5', title: 'Write empty state copy', completed: true },
          { _id: 'sub-6', title: 'Plug in illustration asset', completed: true },
        ],
        '2026-05-14T14:00:00.000Z'
      ),
      this.createSeedTask(
        'task-4',
        'Audit task detail interactions',
        'Check completion toggles, activity trail, and CTA wording.',
        '2026-06-02',
        'High',
        false,
        taskUsers[2],
        [
          { _id: 'sub-7', title: 'Verify activity timeline labels', completed: false },
        ],
        '2026-05-22T08:30:00.000Z'
      ),
      this.createSeedTask(
        'task-5',
        'Refresh organization member list',
        'Ensure member roles and counts are visible for demo reviews.',
        '2026-06-04',
        'Medium',
        false,
        taskUsers[1],
        [],
        '2026-05-16T16:00:00.000Z'
      ),
      this.createSeedTask(
        'task-6',
        'Document frontend-only deployment notes',
        'Capture the setup used for no-backend testing so teammates can reuse it.',
        '2026-05-19',
        'Low',
        true,
        taskUsers[0],
        [],
        '2026-05-10T09:30:00.000Z'
      ),
    ];

    return {
      currentUserId: 'user-1',
      users,
      organizations,
      tasks,
      activities: {
        'task-1': [
          this.createSeedActivity('act-1', 'created', 'Task "Finalize extension demo checklist" was created.', users[0].email, users[0]._id, '2026-05-20T10:00:00.000Z'),
          this.createSeedActivity('act-2', 'subtask_toggled', 'Subtask "Confirm routes load without backend" was completed.', users[0].email, users[0]._id, '2026-05-21T12:00:00.000Z'),
        ],
        'task-2': [
          this.createSeedActivity('act-3', 'created', 'Task "Review dashboard styling polish" was created.', users[1].email, users[1]._id, '2026-05-18T11:00:00.000Z'),
        ],
        'task-3': [
          this.createSeedActivity('act-4', 'created', 'Task "Ship onboarding empty states" was created.', users[1].email, users[1]._id, '2026-05-14T14:00:00.000Z'),
          this.createSeedActivity('act-5', 'status_changed', 'Task "Ship onboarding empty states" was marked as completed.', users[1].email, users[1]._id, '2026-05-18T15:00:00.000Z'),
        ],
        'task-4': [
          this.createSeedActivity('act-6', 'created', 'Task "Audit task detail interactions" was created.', users[2].email, users[2]._id, '2026-05-22T08:30:00.000Z'),
        ],
        'task-5': [
          this.createSeedActivity('act-7', 'created', 'Task "Refresh organization member list" was created.', users[1].email, users[1]._id, '2026-05-16T16:00:00.000Z'),
        ],
        'task-6': [
          this.createSeedActivity('act-8', 'created', 'Task "Document frontend-only deployment notes" was created.', users[0].email, users[0]._id, '2026-05-10T09:30:00.000Z'),
        ],
      },
      visitorCount: 128,
    };
  }

  private createSeedTask(
    id: string,
    title: string,
    description: string,
    deadline: string,
    priority: string,
    completed: boolean,
    user: TaskUser,
    subtasks: Subtask[],
    createdAt: string
  ): DemoTask {
    return {
      _id: id,
      title,
      description,
      deadline,
      priority,
      completed,
      user,
      subtasks,
      createdAt,
      updatedAt: createdAt,
      __v: 0,
    };
  }

  private createSeedActivity(
    id: string,
    action: DemoActivity['action'],
    details: string,
    email: string,
    userId: string,
    createdAt: string
  ): DemoActivity {
    return {
      _id: id,
      action,
      details,
      createdAt,
      user: {
        _id: userId,
        email,
      },
    };
  }

  private createMember(
    id: string,
    user: UserItem,
    role: 'admin' | 'member',
    joinedAt: string
  ) {
    return {
      _id: id,
      user: {
        _id: user._id,
        email: user.email,
      },
      role,
      joinedAt,
    };
  }

  private createActivity(action: DemoActivity['action'], details: string): DemoActivity {
    const currentUser = this.getCurrentUser();
    return {
      _id: this.createId('act'),
      action,
      details,
      createdAt: new Date().toISOString(),
      user: {
        _id: currentUser._id,
        email: currentUser.email,
      },
    };
  }

  private pushActivity(
    store: DemoStore,
    taskId: string,
    action: DemoActivity['action'],
    details: string
  ) {
    const activity = this.createActivity(action, details);
    const existing = store.activities[taskId] || [];
    store.activities[taskId] = [activity, ...existing];
  }

  private mapSubtasks(subtasks: any[] = []): Subtask[] {
    return subtasks.map((subtask) => ({
      _id: subtask._id || this.createId('sub'),
      title: subtask.title,
      completed: !!subtask.completed,
    }));
  }

  private findUserById(userId: string, users: UserItem[]): TaskUser {
    const user = users.find((item) => item._id === userId) || users[0];
    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      __v: user.__v,
    };
  }

  createId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
