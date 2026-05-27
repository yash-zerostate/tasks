import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tasks, Task as TaskItem, User as TaskUser } from '../core/models/tasks.model';
import { Task as SingleTask } from '../core/models/task.model';
import { DemoDataService } from './demo-data.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private demoData = inject(DemoDataService);

  createTask(task: any): Observable<any> {
    const created = this.demoData.createTask(task);
    return of({
      status: 'success',
      message: 'Task created in demo mode',
      data: created,
    });
  }

  getAllTasks(): Observable<Tasks> {
    const tasks = this.demoData.getTasks();
    return of(this.buildTasksResponse(tasks, 1, tasks.length || 10));
  }

  getCompletedTasks(
    page: number,
    limit: number,
    search: string = '',
    priority: string = ''
  ): Observable<Tasks> {
    const filtered = this.filterTasks(true, search, priority);
    return of(this.buildTasksResponse(filtered, page, limit));
  }

  getPendingTasks(
    page: number,
    limit: number,
    search: string = '',
    priority: string = '',
    sortBy: string = 'deadline',
    order: string = 'asc'
  ): Observable<Tasks> {
    const filtered = this.sortTasks(
      this.filterTasks(false, search, priority),
      sortBy,
      order
    );
    return of(this.buildTasksResponse(filtered, page, limit));
  }

  getUserTasks(page: number, limit: number): Observable<Tasks> {
    const currentUserId = this.demoData.getCurrentUserId();
    const tasks = this.demoData
      .getTasks()
      .filter((task) => typeof task.user !== 'string' && task.user._id === currentUserId);
    return of(this.buildTasksResponse(tasks, page, limit));
  }

  getTaskById(id: string): Observable<SingleTask> {
    const task = this.demoData.getTaskById(id)!;
    const user =
      typeof task.user === 'string'
        ? ({
            _id: 'user-demo',
            email: task.user,
            role: 'user',
            __v: 0,
          } as TaskUser)
        : task.user;

    return of({
      status: 'success',
      message: 'Task fetched from demo data',
      data: {
        ...task,
        user,
      },
    });
  }

  updateTask(id: string, task: any): Observable<any> {
    const updated = this.demoData.updateTask(id, task);
    return of({
      status: 'success',
      message: 'Task updated in demo mode',
      data: updated,
    });
  }

  deleteTask(id: string): Observable<any> {
    return of({
      status: 'success',
      message: 'Task deleted in demo mode',
      data: this.demoData.deleteTask(id),
    });
  }

  getTaskStats(): Observable<any> {
    return of({
      status: 'success',
      message: 'Stats fetched from demo data',
      data: this.demoData.getTaskStats(),
    });
  }

  getTaskActivities(id: string): Observable<any> {
    return of({
      status: 'success',
      message: 'Activities fetched from demo data',
      data: this.demoData.getTaskActivities(id),
    });
  }

  private filterTasks(completed: boolean, search: string, priority: string) {
    const searchValue = search.trim().toLowerCase();
    return this.demoData.getTasks().filter((task) => {
      const matchesCompletion = task.completed === completed;
      const matchesPriority = !priority || task.priority === priority;
      const matchesSearch =
        !searchValue ||
        task.title.toLowerCase().includes(searchValue) ||
        task.description.toLowerCase().includes(searchValue);

      return matchesCompletion && matchesPriority && matchesSearch;
    });
  }

  private sortTasks(tasks: TaskItem[], sortBy: string, order: string) {
    const direction = order === 'desc' ? -1 : 1;
    const priorityWeight: Record<string, number> = {
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return [...tasks].sort((a, b) => {
      let result = 0;

      if (sortBy === 'createdAt') {
        result =
          new Date(a.createdAt || '').getTime() -
          new Date(b.createdAt || '').getTime();
      } else if (sortBy === 'priority') {
        result = priorityWeight[a.priority] - priorityWeight[b.priority];
      } else {
        result = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }

      return result * direction;
    });
  }

  private buildTasksResponse(tasks: TaskItem[], page: number, limit: number): Tasks {
    const safeLimit = Math.max(limit, 1);
    const totalTasks = tasks.length;
    const totalPages = Math.max(1, Math.ceil(totalTasks / safeLimit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * safeLimit;

    return {
      status: 'success',
      message: 'Tasks fetched from demo data',
      data: {
        tasks: tasks.slice(start, start + safeLimit),
        totalTasks,
        totalPages,
        currentPage,
      },
    };
  }
}
