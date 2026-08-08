import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { WorkoutTemplate } from '../workout-templates/workout-templates.service';

export interface UserWorkoutAssignment {
  id: number;
  userId: number;
  templateId: number;
  startDate: string;
  endDate: string | null;   // null = indefinite
  status: string;
  createdAt: string;
  template: WorkoutTemplate;
}

@Injectable({
  providedIn: 'root'
})
export class UserWorkoutAssignmentService {

  private readonly baseUrl = environment.baseUrl + '/user-workout-assignment';

  constructor(private http: HttpClient) {}

  /** Create (or replace) the member's active assignment */
  createAssignment(userId: number, templateId: number, programLengthWeeks: number | null): Observable<UserWorkoutAssignment> {
    return this.http.post<UserWorkoutAssignment>(this.baseUrl, { userId, templateId, programLengthWeeks });
  }

  /**
   * Returns the active assignment or null.
   * The backend sends 204 No Content when there is no active assignment,
   * so we map that to null with catchError.
   */
  getActiveAssignment(userId: number): Observable<UserWorkoutAssignment | null> {
    return this.http.get<UserWorkoutAssignment>(`${this.baseUrl}/active/${userId}`).pipe(
      catchError(() => of(null))
    );
  }
}
