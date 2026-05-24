import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutTemplatesService, WorkoutTemplate, TemplateMatchCriteria } from 'src/app/services/workout-templates/workout-templates.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { UserWorkoutAssignmentService } from 'src/app/services/user-workout-assignment/user-workout-assignment.service';

@Component({
  selector: 'app-my-workout-plan',
  standalone: false,
  templateUrl: './my-workout-plan.component.html',
  styleUrl: './my-workout-plan.component.scss'
})
export class MyWorkoutPlanComponent implements OnInit {

  matchedTemplate: WorkoutTemplate | null = null;
  isLoading = true;
  hasParams = false;
  noMatch = false;

  templateExercises: any[] = [];
  exercisesLoading = false;
  selectedDay: number | null = null;

  level: string | null = null;
  goal: string | null = null;
  bmiCategory: string | null = null;
  private gender: string | null = null;
  private age: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutTemplatesService: WorkoutTemplatesService,
    private workoutService: WorkoutManagementService,
    private notificationService: NotificationService,
    private assignTrainerService: AssignTrainerServiceService,
    private httpService: HttpService,
    private messageService: MessageServiceService,
    private assignmentService: UserWorkoutAssignmentService
  ) {}

  ngOnInit(): void {
    this.level       = this.route.snapshot.queryParamMap.get('level');
    this.goal        = this.route.snapshot.queryParamMap.get('goal');
    this.gender      = this.route.snapshot.queryParamMap.get('gender');
    this.bmiCategory = this.route.snapshot.queryParamMap.get('bmiCategory');
    this.age         = Number(this.route.snapshot.queryParamMap.get('age')) || null;

    if (this.level && this.goal) {
      // User just came from the workout form — run matching
      this.hasParams = true;
      this.runMatching();
    } else {
      // No params — try to load an existing saved assignment
      this.loadFromSavedAssignment();
    }
  }

  // Matching flow (user just submitted the form)

  private runMatching(): void {
    const criteria: TemplateMatchCriteria = {
      level: this.level!,
      goal: this.goal!,
      gender: this.gender ?? '',
      bmiCategory: this.bmiCategory ?? '',
      age: this.age ?? 0
    };

    this.workoutTemplatesService.getTopMatchingTemplate(criteria).subscribe({
      next: (template) => {
        this.matchedTemplate = template;
        this.isLoading = false;

        if (!template) {
          this.noMatch = true;
          this.notifyTrainerNoMatch();
        } else {
          this.saveAssignment(template);
          this.loadExercises(template.id!);
        }
      },
      error: () => {
        this.messageService.showError('Could not load workout plans.');
        this.isLoading = false;
      }
    });
  }

  private saveAssignment(template: WorkoutTemplate): void {
    const userId = Number(this.httpService.getUserId());
    if (!userId) return;

    this.assignmentService.createAssignment(
      userId,
      template.id!,
      template.programLengthWeeks ?? null
    ).subscribe({ error: () => {} }); // silent — UI already showing the plan
  }

  // Saved-assignment flow (user navigates directly to the page)

  private loadFromSavedAssignment(): void {
    const userId = Number(this.httpService.getUserId());
    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.assignmentService.getActiveAssignment(userId).subscribe({
      next: (assignment) => {
        if (!assignment || !assignment.template) {
          this.isLoading = false;
          return;
        }

        this.matchedTemplate = assignment.template;
        this.hasParams = true; // re-use the "has result" flag to show the results block

        // Reconstruct display labels from the template
        this.level       = assignment.template.difficultyLevel;
        this.goal        = assignment.template.goal;
        this.bmiCategory = null;
        this.isLoading   = false;

        this.loadExercises(assignment.template.id!);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Shared helpers

  private loadExercises(templateId: number): void {
    this.exercisesLoading = true;
    this.workoutTemplatesService.getTemplateExercises(templateId).subscribe({
      next: (exercises) => {
        this.templateExercises = [...exercises].sort((a, b) =>
          a.workoutDay - b.workoutDay || (a.exerciseOrder ?? 0) - (b.exerciseOrder ?? 0)
        );
        this.exercisesLoading = false;
        if (this.templateExercises.length > 0) {
          this.selectedDay = Number(this.templateExercises[0].workoutDay);
        }
      },
      error: () => {
        this.exercisesLoading = false;
      }
    });
  }

  get usedDays(): number[] {
    return [...new Set(this.templateExercises.map(e => Number(e.workoutDay)))].sort((a, b) => a - b);
  }

  exercisesForDay(day: number): any[] {
    return this.templateExercises
      .filter(e => Number(e.workoutDay) === day)
      .sort((a, b) => (a.exerciseOrder ?? 0) - (b.exerciseOrder ?? 0));
  }

  private notifyTrainerNoMatch(): void {
    const workoutData = this.workoutService.getWorkoutData();
    if (!workoutData?.trainerId) return;

    this.assignTrainerService.getTrainerUserId(workoutData.trainerId).subscribe({
      next: (response: any) => {
        const memberName = this.httpService.getLoginNameFromCache() ?? 'A member';
        const message = `No matching template found for ${memberName} — Goal: ${this.formatGoal(this.goal!)}, Level: ${this.level}, BMI: ${this.bmiCategory}. Please create a suitable template.`;
        this.notificationService.addNotification(message, 'warning', response.userId, workoutData);
      },
      error: () => {}
    });
  }

  formatGoal(goal: string): string {
    const map: Record<string, string> = {
      muscle_gain: 'Muscle Gain',
      fat_loss: 'Fat Loss',
      general_fitness: 'General Fitness',
      endurance: 'Endurance',
      strength: 'Strength'
    };
    return map[goal?.toLowerCase()] || goal;
  }

  selectDay(day: number): void {
    this.selectedDay = day;
  }

  goToWorkoutForm(): void {
    this.router.navigate(['/pages/workout']);
  }
}
