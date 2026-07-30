import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { AddExerciseService } from 'src/app/services/add-exercise/add-exercise.service';
import { WorkoutTemplatesService } from 'src/app/services/workout-templates/workout-templates.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { UserWorkoutAssignmentService } from 'src/app/services/user-workout-assignment/user-workout-assignment.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

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
  isSubmitted = false;
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

  readonly dialog = inject(MatDialog);

  // Pending custom request context (set when navigated from Pending Custom Requests page)
  pendingRequestId: string | null = null;
  pendingMemberUserId: number | null = null;
  pendingMemberName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: AddExerciseService,
    private templateService: WorkoutTemplatesService,
    private messageService: MessageServiceService,
    private assignmentService: UserWorkoutAssignmentService,
    private workoutService: WorkoutManagementService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Read pending request context from query params
    this.pendingRequestId   = this.route.snapshot.queryParamMap.get('pendingRequestId');
    this.pendingMemberUserId = Number(this.route.snapshot.queryParamMap.get('memberUserId')) || null;
    this.pendingMemberName  = this.route.snapshot.queryParamMap.get('memberName');

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
      restSeconds:   [30, [Validators.min(0)]],
      exerciseOrder: [1,  [Validators.min(1)]],
      notes:         ['', [Validators.maxLength(500)]]
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
    this.isSubmitted = true;
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const { exerciseId, workoutDay } = this.assignmentForm.value;
    const selectedExercise = this.exerciseList.find(x => x.id == exerciseId);

    const isDuplicate = this.assignedExercises.some(e =>
      e.exerciseId == exerciseId && Number(e.workoutDay) === Number(workoutDay)
    );

    if (isDuplicate) {
      this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Duplicate Exercise',
          message: `"${selectedExercise?.exerciseName}" is already assigned to Day ${workoutDay}. Add it again anyway?`
        }
      }).afterClosed().subscribe(confirmed => {
        if (confirmed) this.doAdd(selectedExercise);
      });
    } else {
      this.doAdd(selectedExercise);
    }
  }

  private doAdd(selectedExercise: any): void {
    const { exerciseId, workoutDay, sets, reps, restSeconds, exerciseOrder, notes } = this.assignmentForm.value;

    const payload = {
      templateId:    this.templateData?.id,
      exerciseId,
      exerciseName:  selectedExercise?.exerciseName,
      workoutDay,
      sets,
      reps,
      restSeconds,
      exerciseOrder,
      notes
    };

    this.assignedExercises = [...this.assignedExercises, payload];
    this.dataSource.data   = this.assignedExercises;
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
    this.isSubmitted = false;
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
        if (this.pendingRequestId && this.pendingMemberUserId) {
          // Auto-assign template to the waiting member
          this.assignmentService.createAssignment(
            this.pendingMemberUserId,
            this.templateData.id,
            this.templateData.programLengthWeeks ?? null
          ).subscribe({
            next: () => {
              // Mark request as Assigned
              this.workoutService.updateStatusByUserId(this.pendingMemberName, 'Assigned')
                .subscribe({ error: () => {} });

              // Notify the member that their plan is ready
              this.notificationService.addNotification(
                `Your workout plan "${this.templateData.templateName}" is ready! Your trainer has set up a personalised plan for you.`,
                'success',
                this.pendingMemberUserId
              );

              this.messageService.showSuccess(
                `Template saved and assigned to ${this.pendingMemberName}!`
              );
              this.router.navigate(['/pages/workout-plan-upload']);
            },
            error: () => {
              this.messageService.showError(
                'Template saved but could not assign to member. Please assign manually.'
              );
              this.goBack();
            }
          });
        } else {
          this.messageService.showSuccess('Assignments saved successfully!');
          this.goBack();
        }
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }
}
