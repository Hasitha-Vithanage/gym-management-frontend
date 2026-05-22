import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { AddExerciseService } from 'src/app/services/add-exercise/add-exercise.service';
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

  /** Two-way bound to the search input in the left panel */
  searchQuery: string = '';

  /** The card the user last clicked — drives the exerciseId form control */
  selectedExercise: any = null;

  displayedColumns: string[] = [
    'workoutDay',
    'exerciseName',
    'sets',
    'reps',
    'restSeconds',
    'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  constructor(
    private fb: FormBuilder,
    private exerciseService: AddExerciseService,
    private messageService: MessageServiceService,
    public dialogRef: MatDialogRef<ExerciseToTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.templateData = this.data.template;
    this.initializeForm();
    this.loadExercises();
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
        this.exerciseList = response.filter(x => !x.isDeleted);
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }

  /** Returns exercises filtered by the current search query */
  filteredExercises(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.exerciseList;
    return this.exerciseList.filter(e =>
      e.exerciseName?.toLowerCase().includes(q) ||
      e.muscleGroup?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    );
  }

  /** Clicking a card selects it and pre-fills the exerciseId control */
  selectExercise(exercise: any): void {
    this.selectedExercise = exercise;
    this.assignmentForm.patchValue({ exerciseId: exercise.id });
  }

  /**
   * One-click add from the card button:
   * pre-fills the exercise and immediately submits
   * (uses whatever day/sets/reps are currently in the form).
   */
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
      templateId:    this.templateData.id,
      exerciseId:    this.assignmentForm.value.exerciseId,
      exerciseName:  selectedExercise?.exerciseName,
      workoutDay:    this.assignmentForm.value.workoutDay,
      sets:          this.assignmentForm.value.sets,
      reps:          this.assignmentForm.value.reps,
      restSeconds:   this.assignmentForm.value.restSeconds,
      exerciseOrder: this.assignmentForm.value.exerciseOrder,
      notes:         this.assignmentForm.value.notes
    };

    // TEMPORARY LOCAL ADD — replace with API call when ready
    this.assignedExercises = [...this.assignedExercises, payload];
    this.dataSource.data    = this.assignedExercises;

    this.messageService.showSuccess('Exercise assigned successfully!');
    this.resetForm();
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

  closeDialog(): void {
    this.dialogRef.close({ action: 'assigned' });
  }
}