import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AiSubtasksResponse {
  status: string;
  message: string;
  data: { subtasks: string[] };
}

export interface AiDescriptionResponse {
  status: string;
  message: string;
  data: { description: string };
}

export interface AiSummaryResponse {
  status: string;
  message: string;
  data: { summary: string };
}

export interface AiPriorityResponse {
  status: string;
  message: string;
  data: { priority: 'Low' | 'Medium' | 'High'; reason: string };
}

export interface AiAskResponse {
  status: string;
  message: string;
  data: { answer: string };
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  suggestSubtasks(title: string, description?: string): Observable<AiSubtasksResponse> {
    const base = title || 'task';
    return of({
      status: 'success',
      message: 'Demo AI subtasks generated',
      data: {
        subtasks: [
          `Clarify the goal for ${base.toLowerCase()}`,
          `Break ${base.toLowerCase()} into one small deliverable`,
          `Run a quick review before marking ${base.toLowerCase()} done`,
        ],
      },
    });
  }

  improveDescription(title: string, description?: string): Observable<AiDescriptionResponse> {
    const refined = description?.trim()
      ? `${description.trim()} Focus on the user-facing outcome, blockers, and the smallest next step.`
      : `Deliver ${title} with a clear owner, a visible outcome, and one measurable next step.`;

    return of({
      status: 'success',
      message: 'Demo AI description generated',
      data: { description: refined },
    });
  }

  summarizeTasks(tasks: any[]): Observable<AiSummaryResponse> {
    const completed = tasks.filter((task) => task.completed).length;
    const high = tasks.filter((task) => task.priority === 'High').length;

    return of({
      status: 'success',
      message: 'Demo AI summary generated',
      data: {
        summary: `You have ${tasks.length} tasks in this demo workspace, with ${completed} completed and ${high} marked high priority. The main recommendation is to finish the urgent in-progress work before starting new low-priority items.`,
      },
    });
  }

  suggestPriority(title: string, description?: string, deadline?: string): Observable<AiPriorityResponse> {
    const lower = `${title} ${description || ''}`.toLowerCase();
    const priority = lower.includes('urgent') || lower.includes('critical') ? 'High' : deadline ? 'Medium' : 'Low';
    const reason =
      priority === 'High'
        ? 'The wording suggests this task needs fast attention.'
        : priority === 'Medium'
        ? 'There is a deadline, so it should stay visible in the queue.'
        : 'This looks safe to schedule after the more time-sensitive work.';

    return of({
      status: 'success',
      message: 'Demo AI priority generated',
      data: { priority, reason },
    });
  }

  askAssistant(question: string, context?: string): Observable<AiAskResponse> {
    const answer = context
      ? `Demo AI review: based on the current task details, start with the smallest blocked item, confirm ownership, and update the checklist after each visible milestone.`
      : `Demo assistant: for "${question}", I’d suggest keeping tasks small, prioritizing deadlines, and closing one important item before opening two new ones.`;

    return of({
      status: 'success',
      message: 'Demo AI answer generated',
      data: { answer },
    });
  }
}
