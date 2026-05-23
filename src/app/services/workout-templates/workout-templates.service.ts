import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/app/environments/environment';

export interface WorkoutTemplate {
  id?: number;
  templateName: string;
  description?: string;

  // Classification
  goal: string;
  difficultyLevel: string;
  intensityLevel: string;
  location: string;

  // Schedule
  durationMinutes: number;
  daysPerWeek: number;
  programLengthWeeks?: number;

  // Equipment & Targeting
  equipmentRequired: string[];
  suitableFor: string;
  recommendedBMI?: string[];

  // Meta
  status: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})

export class WorkoutTemplatesService {

   private readonly baseUrl = environment.baseUrl + '/workout-templates';
  
    constructor(private http: HttpClient) {}
  
    /** GET all (filters soft-deleted locally as fallback) */
    getAllWorkoutTemplates(): Observable<WorkoutTemplate[]> {
      return this.http.get<WorkoutTemplate[]>(this.baseUrl).pipe(
        map((data) => data.filter((e) => !e.isDeleted)),
        catchError(this.handleError)
      );
    }
  
    /** GET single by ID */
    getWorkoutTemplateById(id: number): Observable<WorkoutTemplate> {
      return this.http.get<WorkoutTemplate>(`${this.baseUrl}/${id}`).pipe(
        catchError(this.handleError)
      );
    }
  
    /** POST — multipart/form-data (image support) */
    createWorkoutTemplate(formData: FormData): Observable<WorkoutTemplate> {
      return this.http.post<WorkoutTemplate>(this.baseUrl, formData).pipe(
        catchError(this.handleError)
      );
    }
  
    /** PUT — update by ID */
    updateWorkoutTemplate(id: number, formData: FormData): Observable<WorkoutTemplate> {
      return this.http.put<WorkoutTemplate>(`${this.baseUrl}/${id}`, formData).pipe(
        catchError(this.handleError)
      );
    }
  
    /** GET filtered by difficulty level and goal */
    getTemplatesByFilter(level: string, goal: string): Observable<WorkoutTemplate[]> {
      return this.getAllWorkoutTemplates().pipe(
        map((templates) =>
          templates.filter(
            (t) =>
              t.difficultyLevel?.toLowerCase() === level?.toLowerCase() &&
              t.goal?.toLowerCase() === goal?.toLowerCase()
          )
        )
      );
    }

    /** DELETE — hard delete by ID */
    deleteWorkoutTemplate(id: number): Observable<void> {
      return this.http.put<void>(`${this.baseUrl}/delete/${id}`, {}).pipe(
        catchError(this.handleError)
      );
    }
  
    private handleError(error: any): Observable<never> {
      const msg = error?.error?.message
        || error?.message
        || 'An unexpected error occurred.';
      console.error('[AddExerciseService]', error);
      return throwError(() => new Error(msg));
    }
}
