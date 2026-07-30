import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
      map((data) => data.filter((e) => !(e.isDeleted || (e as any).deleted)))
    );
  }

  /** GET single by ID */
  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.baseUrl}/${id}`);
  }

  /** POST — multipart/form-data (image support) */
  createExercise(formData: FormData): Observable<Exercise> {
    return this.http.post<Exercise>(this.baseUrl, formData);
  }

  /** PUT — update by ID */
  updateExercise(id: number, formData: FormData): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.baseUrl}/${id}`, formData);
  }

  /** DELETE — hard delete by ID */
  deleteExercise(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/delete/${id}`, {});
  }
}
