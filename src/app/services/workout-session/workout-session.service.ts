import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

export interface WorkoutSession {
  id?: number;
  assignmentId: number;
  memberId: number;
  workoutDay: number;
  sessionDate?: string;
  status?: string;
  notes?: string;
}

export interface WorkoutSessionExercise {
  id?: number;
  sessionId?: number;
  templateExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  setsCompleted: number;
  repsLogged?: string | null;
  weightKg?: number | null;
  completed: boolean;
}

export interface WorkoutSessionSummary {
  totalSessionsCompleted: number;
  sessionsThisWeek: number;
  targetSessionsPerWeek: number;
  currentProgramWeek: number;
  totalProgramWeeks: number;
  lastSessionDate: string | null;
  daysSinceLastSession: number | null;
  completedWorkoutDays: number[];
  lastWorkoutDay: number | null;
}

export interface MemberProgressSummary {
  userId: number;
  memberName: string | null;
  programName: string;
  daysPerWeek: number;
  programStartDate: string;
  currentProgramWeek: number;
  totalProgramWeeks: number | null;
  sessionsThisWeek: number;
  lastSessionDate: string | null;
  daysSinceLastSession: number | null;
  activityStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutSessionService {

  private readonly baseUrl = environment.baseUrl + '/workout-sessions';

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.httpService.getAuthToken()}` });
  }

  createSession(session: WorkoutSession): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(this.baseUrl, session, { headers: this.headers });
  }

  completeSession(sessionId: number, exercises: WorkoutSessionExercise[]): Observable<WorkoutSession> {
    return this.http.put<WorkoutSession>(`${this.baseUrl}/${sessionId}/complete`, exercises, { headers: this.headers });
  }

  cancelSession(sessionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${sessionId}`, { headers: this.headers });
  }

  getMemberSummary(memberId: number, assignmentId: number): Observable<WorkoutSessionSummary> {
    return this.http.get<WorkoutSessionSummary>(
      `${this.baseUrl}/member/${memberId}/summary?assignmentId=${assignmentId}`,
      { headers: this.headers }
    );
  }

  getMemberSessions(memberId: number): Observable<WorkoutSession[]> {
    return this.http.get<WorkoutSession[]>(`${this.baseUrl}/member/${memberId}`, { headers: this.headers });
  }

  getCompletedDays(assignmentId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/assignment/${assignmentId}/completed-days`, { headers: this.headers });
  }

  getWeeklyFrequency(assignmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assignment/${assignmentId}/weekly-frequency`, { headers: this.headers });
  }

  getExercisePerformance(memberId: number, exerciseId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/member/${memberId}/exercise-performance?exerciseId=${exerciseId}`,
      { headers: this.headers }
    );
  }

  getAllMembersProgress(): Observable<MemberProgressSummary[]> {
    return this.http.get<MemberProgressSummary[]>(`${this.baseUrl}/members-progress`, { headers: this.headers });
  }
}
