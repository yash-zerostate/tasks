import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Visit } from '../core/models/visit.model';
import { DemoDataService } from './demo-data.service';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private demoData = inject(DemoDataService);

  trackProjectVisit(projectName: string): Observable<Visit> {
    return this.demoData.trackVisit(projectName);
  }
}
