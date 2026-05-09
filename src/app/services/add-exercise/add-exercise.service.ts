import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/app/environments/environment';

export interface Exercise {
  id?: number;
  exerciseName: string;
  description?: string;
  instructions?: string;
  muscleGroup: string;
  muscleGroupSecondary?: string;
  exerciseType: string;
  movementType: string;
  difficultyLevel: string;
  intensityLevel: string;
  equipmentType: string;
  location: string;
  goalType: string;
  suitableFor: string;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AddExerciseService {
  private readonly baseUrl = environment.baseUrl + '/exercises';

  constructor(private http: HttpClient) {}

  /** GET all (filters soft-deleted locally as fallback) */
  getAllExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.baseUrl).pipe(
      map((data) => data.filter((e) => !e.isDeleted)),
      catchError(this.handleError)
    );
  }

  /** GET single by ID */
  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /** POST — multipart/form-data (image support) */
  createExercise(formData: FormData): Observable<Exercise> {
    return this.http.post<Exercise>(this.baseUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  /** PUT — update by ID */
  updateExercise(id: number, formData: FormData): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.baseUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /** DELETE — hard delete by ID */
  deleteExercise(id: number): Observable<void> {
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