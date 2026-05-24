import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { AddExerciseService } from 'src/app/services/add-exercise/add-exercise.service';
import { WorkoutTemplatesService } from 'src/app/services/workout-templates/workout-templates.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-exercise-to-template',
  standalone: false,
  templateUrl: './exercise-to-template.component.html',
  styleUrls: ['./exercise-to-template.component.scss']
})
export class ExerciseToTemplateComponent implements OnInit {

  assignmentForm!: FormGroup;

  templateData: any;

  exerciseList: any[] = [];

  assignedExercises: any[] = [];

  workoutDays: number[] = [1, 2, 3, 4, 5, 6, 7];

  searchQuery: string = '';

  selectedExercise: any = null;

  displayedColumns: string[] = [
    'workoutDay',
    'exerciseName',
    'sets',
    'reps',
    'restSeconds',
    'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: AddExerciseService,
    private templateService: WorkoutTemplatesService,
    private messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.templateService.getWorkoutTemplateById(id).subscribe({
      next: (template) => {
        this.templateData = template;
        this.loadAssignedExercises(id);
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
    this.initializeForm();
    this.loadExercises();
  }

  loadAssignedExercises(templateId: number): void {
    this.templateService.getTemplateExercises(templateId).subscribe({
      next: (exercises) => {
        this.assignedExercises = exercises;
        this.dataSource.data = exercises;
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }

  initializeForm(): void {
    this.assignmentForm = this.fb.group({
      exerciseId:    ['', Validators.required],
      workoutDay:    ['', Validators.required],
      sets:          [1,  [Validators.required, Validators.min(1)]],
      reps:          [1,  [Validators.required, Validators.min(1)]],
      restSeconds:   [30],
      exerciseOrder: [1],
      notes:         ['']
    });
  }

  loadExercises(): void {
    this.exerciseService.getAllExercises().subscribe({
      next: (response: any[]) => {
        this.exerciseList = response.filter(x => !(x.isDeleted || x.deleted));
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }

  filteredExercises(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.exerciseList;
    return this.exerciseList.filter(e =>
      e.exerciseName?.toLowerCase().includes(q) ||
      e.muscleGroup?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    );
  }

  selectExercise(exercise: any): void {
    this.selectedExercise = exercise;
    this.assignmentForm.patchValue({ exerciseId: exercise.id });
  }

  quickAdd(exercise: any): void {
    this.selectExercise(exercise);
    this.addExerciseToTemplate();
  }

  addExerciseToTemplate(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const selectedExercise =
      this.exerciseList.find(x => x.id == this.assignmentForm.value.exerciseId);

    const payload = {
      templateId:    this.templateData?.id,
      exerciseId:    this.assignmentForm.value.exerciseId,
      exerciseName:  selectedExercise?.exerciseName,
      workoutDay:    this.assignmentForm.value.workoutDay,
      sets:          this.assignmentForm.value.sets,
      reps:          this.assignmentForm.value.reps,
      restSeconds:   this.assignmentForm.value.restSeconds,
      exerciseOrder: this.assignmentForm.value.exerciseOrder,
      notes:         this.assignmentForm.value.notes
    };

    this.assignedExercises = [...this.assignedExercises, payload];
    this.dataSource.data    = this.assignedExercises;

    this.messageService.showSuccess('Exercise assigned successfully!');
    this.resetForm();
  }

  get usedDays(): number[] {
    const days = [...new Set(this.assignedExercises.map(e => Number(e.workoutDay)))];
    return days.sort((a, b) => a - b);
  }

  exercisesForDay(day: number): any[] {
    return this.assignedExercises.filter(e => Number(e.workoutDay) === day);
  }

  removeExercise(data: any): void {
    this.assignedExercises = this.assignedExercises.filter(x => x !== data);
    this.dataSource.data   = this.assignedExercises;
    this.messageService.showSuccess('Exercise removed successfully!');
  }

  resetForm(): void {
    this.selectedExercise = null;
    this.assignmentForm.reset({
      sets:          1,
      reps:          1,
      restSeconds:   30,
      exerciseOrder: 1
    });
  }

  goBack(): void {
    this.router.navigate(['/pages/workout-templates']);
  }

  saveAssignments(): void {
    if (this.assignedExercises.length === 0) return;

    this.templateService.saveTemplateExercises(this.templateData.id, this.assignedExercises).subscribe({
      next: () => {
        this.messageService.showSuccess('Assignments saved successfully!');
        this.goBack();
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }
}
