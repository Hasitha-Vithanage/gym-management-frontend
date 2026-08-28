import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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
  ageRange?: { min?: number; max?: number };
  exerciseCount?: number;

  // Meta
  status: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateMatchCriteria {
  level: string;
  goal: string;
  gender: string;
  bmiCategory: string;
  age: number;
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
        map((data) => data.filter((e) => !e.isDeleted))
      );
    }

    /** GET single by ID */
    getWorkoutTemplateById(id: number): Observable<WorkoutTemplate> {
      return this.http.get<WorkoutTemplate>(`${this.baseUrl}/${id}`);
    }

    /** POST — multipart/form-data (image support) */
    createWorkoutTemplate(formData: FormData): Observable<WorkoutTemplate> {
      return this.http.post<WorkoutTemplate>(this.baseUrl, formData);
    }

    /** PUT — update by ID */
    updateWorkoutTemplate(id: number, formData: FormData): Observable<WorkoutTemplate> {
      return this.http.put<WorkoutTemplate>(`${this.baseUrl}/${id}`, formData);
    }
  
    /** GET filtered by difficulty level and goal */
    getTemplatesByFilter(level: string, goal: string): Observable<WorkoutTemplate[]> {
      return this.getAllWorkoutTemplates().pipe(
        map((templates) =>
          templates.filter(
            (t) =>
              t.difficultyLevel?.toLowerCase() === level?.toLowerCase() &&
              this.normalizeGoal(t.goal) === this.normalizeGoal(goal)
          )
        )
      );
    }

    /** GET top-scoring template matching all member criteria */
    getTopMatchingTemplate(criteria: TemplateMatchCriteria): Observable<WorkoutTemplate | null> {
      return this.getAllWorkoutTemplates().pipe(
        map((templates) => {
          const scored = templates
            .filter(t => t.status === 'Active')
            .map(t => ({ template: t, score: this.scoreTemplate(t, criteria) }))
            .filter((entry): entry is { template: WorkoutTemplate; score: number } => entry.score !== null);

          if (scored.length === 0) return null;
          scored.sort((a, b) => b.score - a.score);
          // scored.slice(0,3).map(entry => entry.template);
          return scored[0].template;
        })
      );
    }

    /** DELETE — soft delete by ID */
    deleteWorkoutTemplate(id: number): Observable<void> {
      return this.http.put<void>(`${this.baseUrl}/delete/${id}`, {});
    }

    /** GET exercises assigned to a template */
    getTemplateExercises(templateId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/${templateId}/exercises`);
    }

    /** POST bulk-replace exercises for a template */
    saveTemplateExercises(templateId: number, exercises: any[]): Observable<any[]> {
      return this.http.post<any[]>(`${this.baseUrl}/${templateId}/exercises`, exercises);
    }

    /** DELETE single exercise assignment */
    deleteTemplateExercise(templateId: number, id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${templateId}/exercises/${id}`);
    }
  
    private normalizeGoal(goal: string): string {
      return (goal ?? '').toLowerCase().replace(/_/g, ' ');
    }

    private scoreTemplate(t: WorkoutTemplate, criteria: TemplateMatchCriteria): number | null {
      if (t.exerciseCount !== undefined && t.exerciseCount === 0) return null;
      if (this.normalizeGoal(t.goal) !== this.normalizeGoal(criteria.goal)) return null;
      if (t.difficultyLevel?.toLowerCase() !== criteria.level?.toLowerCase()) return null;

      const suitable = t.suitableFor?.toLowerCase();
      if (suitable !== 'all' && suitable !== criteria.gender?.toLowerCase()) return null;

      let score = suitable === criteria.gender?.toLowerCase() ? 3 : 1;

      if (t.recommendedBMI?.length) {
        if (t.recommendedBMI.some(b => b?.toLowerCase() === criteria.bmiCategory?.toLowerCase())) {
          score += 2;
        }
      }

      if (t.ageRange && criteria.age) {
        const withinRange = criteria.age >= (t.ageRange.min ?? 0) && criteria.age <= (t.ageRange.max ?? 999);
        if (withinRange) score += 1;
      }

      return score;
    }
}
