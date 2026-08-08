import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { WorkoutTemplatesService, WorkoutTemplate, TemplateMatchCriteria } from 'src/app/services/workout-templates/workout-templates.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { UserWorkoutAssignmentService, UserWorkoutAssignment } from 'src/app/services/user-workout-assignment/user-workout-assignment.service';
import { WorkoutSessionService, WorkoutSessionSummary, WorkoutSessionExercise } from 'src/app/services/workout-session/workout-session.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { TrainerRequestService } from 'src/app/services/trainer-request/trainer-request.service';

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
  trainerRequested = false;
  private memberName = '';

  templateExercises: any[] = [];
  exercisesLoading = false;
  selectedDay: number | null = null;

  level: string | null = null;
  goal: string | null = null;
  bmiCategory: string | null = null;
  private gender: string | null = null;
  private age: number | null = null;

  // Assignment & progress tracking
  activeAssignment: UserWorkoutAssignment | null = null;
  summary: WorkoutSessionSummary | null = null;
  summaryLoading = false;

  // Session logging state
  sessionActive = false;
  activeSessionDay: number | null = null;
  currentSessionId: number | null = null;
  savingSession = false;

  // Set & weight tracking — keyed by templateExerciseId
  setTrack: { [exerciseId: number]: boolean[] } = {};
  weightTrack: { [exerciseId: number]: number | null } = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly workoutTemplatesService: WorkoutTemplatesService,
    private readonly workoutService: WorkoutManagementService,
    private readonly notificationService: NotificationService,
    private readonly assignTrainerService: AssignTrainerServiceService,
    private readonly httpService: HttpService,
    private readonly messageService: MessageServiceService,
    private readonly assignmentService: UserWorkoutAssignmentService,
    private readonly sessionService: WorkoutSessionService,
    private readonly userProfileService: UserProfileService,
    private readonly trainerRequestService: TrainerRequestService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.memberName = this.httpService.getFullNameFromCache() || this.httpService.getLoginNameFromCache() || '';
    this.level       = this.route.snapshot.queryParamMap.get('level');
    this.goal        = this.route.snapshot.queryParamMap.get('goal');
    this.gender      = this.route.snapshot.queryParamMap.get('gender');
    this.bmiCategory = this.route.snapshot.queryParamMap.get('bmiCategory');
    this.age         = Number(this.route.snapshot.queryParamMap.get('age')) || null;

    if (this.level && this.goal) {
      this.hasParams = true;
      this.runMatching();
    } else {
      this.loadFromSavedAssignment();
    }
  }

  // ── Matching flow ────────────────────────────────────────────────────────────

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

        if (template) {
          this.saveAssignment(template);
          this.loadExercises(template.id!);
          this.notifyTrainerWithMatch(template);
          this.workoutService.updateStatusByUserId(this.memberName, 'Auto Matched').subscribe({ error: () => {} });
        } else {
          this.noMatch = true;
          this.loadTrainerRequestStatus();
          this.notifyTrainerNoMatch();
          this.workoutService.updateStatusByUserId(this.memberName, 'Pending Custom').subscribe({ error: () => {} });

          // A "Pending Custom" workout request only ever becomes visible to a trainer
          // once that trainer already has this member in their roster (Pending Requests
          // is scoped per-trainer). Without a trainer assigned yet, this request would
          // otherwise sit invisible forever, so auto-escalate to management immediately
          // instead of relying on the member noticing and clicking "Request a Trainer".
          if (!this.hasTrainer) {
            this.requestTrainer();
          }
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
    ).subscribe({
      next: (assignment) => {
        this.activeAssignment = assignment;
        this.loadSummary(userId, assignment.id);
      },
      error: () => {}
    });
  }

  // ── Saved-assignment flow ────────────────────────────────────────────────────

  private loadFromSavedAssignment(): void {
    const userId = Number(this.httpService.getUserId());
    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.assignmentService.getActiveAssignment(userId).subscribe({
      next: (assignment) => {
        if (!assignment?.template) {
          this.isLoading = false;
          return;
        }

        this.activeAssignment  = assignment;
        this.matchedTemplate   = assignment.template;
        this.hasParams         = true;
        this.level             = assignment.template.difficultyLevel;
        this.goal              = assignment.template.goal;
        this.bmiCategory       = null;
        this.isLoading         = false;

        this.loadExercises(assignment.template.id!);
        this.loadSummary(userId, assignment.id);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // ── Progress summary ─────────────────────────────────────────────────────────

  private loadSummary(memberId: number, assignmentId: number): void {
    this.summaryLoading = true;
    this.sessionService.getMemberSummary(memberId, assignmentId).subscribe({
      next: (s) => {
        this.summary = s;
        this.summaryLoading = false;
      },
      error: () => { this.summaryLoading = false; }
    });
  }

  /**
   * Calculates the next workout day by cycling through the split in order.
   * Example: 3-day split [1,2,3] — last logged Day 2 → next is Day 3.
   * If no sessions yet, returns the first day.
   */
  get nextWorkoutDay(): number | null {
    if (this.usedDays.length === 0) return null;
    if (!this.summary?.lastWorkoutDay) return this.usedDays[0];

    const lastIndex = this.usedDays.indexOf(this.summary.lastWorkoutDay);
    if (lastIndex === -1) return this.usedDays[0];

    const nextIndex = (lastIndex + 1) % this.usedDays.length;
    return this.usedDays[nextIndex];
  }

  startNextWorkout(): void {
    const next = this.nextWorkoutDay;
    if (next === null) return;
    this.selectedDay = next;
    this.startSession(next);
  }

  get weekProgressPercent(): number {
    if (!this.summary?.targetSessionsPerWeek) return 0;
    return Math.min(
      Math.round((this.summary.sessionsThisWeek / this.summary.targetSessionsPerWeek) * 100),
      100
    );
  }

  get programProgressPercent(): number {
    if (!this.summary?.totalProgramWeeks) return 0;
    return Math.min(
      Math.round(((this.summary.currentProgramWeek - 1) / this.summary.totalProgramWeeks) * 100),
      100
    );
  }

  // ── Exercises ────────────────────────────────────────────────────────────────

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
      error: () => { this.exercisesLoading = false; }
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

  selectDay(day: number): void {
    if (this.sessionActive && day !== this.activeSessionDay) return;
    this.selectedDay = day;
  }

  /**
   * True when this day has been done in the current rotation cycle.
   * A day is "done this cycle" if its position in usedDays is ≤ the position
   * of lastWorkoutDay. This naturally resets when the cycle wraps: after the
   * last day is logged, the next cycle starts and only days before the new
   * lastWorkoutDay (i.e. none yet) are considered done.
   */
  isDayCompleted(day: number): boolean {
    if (!this.summary?.lastWorkoutDay) return false;
    const lastIndex = this.usedDays.indexOf(this.summary.lastWorkoutDay);
    const dayIndex  = this.usedDays.indexOf(day);
    if (lastIndex === -1 || dayIndex === -1) return false;
    return dayIndex <= lastIndex;
  }

  // ── Session logging ──────────────────────────────────────────────────────────

  startSession(day: number): void {
    const memberId = Number(this.httpService.getUserId());
    if (!memberId || !this.activeAssignment) return;

    const exercises = this.exercisesForDay(day);

    this.setTrack = {};
    this.weightTrack = {};
    exercises.forEach(ex => {
      this.setTrack[ex.id] = new Array(ex.sets).fill(false);
      this.weightTrack[ex.id] = null;
    });

    this.sessionService.createSession({
      assignmentId: this.activeAssignment.id,
      memberId,
      workoutDay: day
    }).subscribe({
      next: (session) => {
        this.currentSessionId = session.id!;
        this.sessionActive    = true;
        this.activeSessionDay = day;
      },
      error: () => {
        this.messageService.showError('Could not start session. Please try again.');
      }
    });
  }

  toggleSet(exerciseId: number, setIndex: number): void {
    if (!this.sessionActive) return;
    this.setTrack[exerciseId][setIndex] = !this.setTrack[exerciseId][setIndex];
  }

  isSetDone(exerciseId: number, setIndex: number): boolean {
    return this.setTrack[exerciseId]?.[setIndex] ?? false;
  }

  getSetsCompleted(exerciseId: number): number {
    return (this.setTrack[exerciseId] ?? []).filter(Boolean).length;
  }

  setArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  confirmCompleteSession(): void {
    if (!this.currentSessionId || this.savingSession) return;

    const exercises  = this.exercisesForDay(this.activeSessionDay!);
    const incomplete = exercises.filter(ex => this.getSetsCompleted(ex.id) < ex.sets);

    let title: string;
    let message: string;

    if (incomplete.length === 0) {
      title   = 'Complete Session';
      message = 'Great work! You\'ve completed all exercises. Are you sure you want to complete this session?';
    } else {
      const names = incomplete.map(ex => ex.exerciseName).join(', ');
      title   = 'Incomplete Exercises';
      message = `You have ${incomplete.length} uncompleted exercise${incomplete.length > 1 ? 's' : ''}: ${names}. ` +
                `Incomplete sets will be logged as partial. Are you sure you want to complete the session?`;
    }

    this.dialog.open(ConfirmDialogComponent, { width: '440px', data: { title, message } })
      .afterClosed().subscribe(confirmed => { if (confirmed) this.completeSession(); });
  }

  completeSession(): void {
    if (!this.currentSessionId || this.savingSession) return;

    const exercises = this.exercisesForDay(this.activeSessionDay!);
    const payload: WorkoutSessionExercise[] = exercises.map(ex => ({
      templateExerciseId: ex.id,
      exerciseId: ex.exerciseId ?? 0,
      exerciseName: ex.exerciseName,
      setsCompleted: this.getSetsCompleted(ex.id),
      weightKg: this.weightTrack[ex.id] ?? null,
      repsLogged: null,
      completed: this.getSetsCompleted(ex.id) === ex.sets
    }));

    this.savingSession = true;
    this.sessionService.completeSession(this.currentSessionId, payload).subscribe({
      next: () => {
        this.savingSession = false;
        this.activeSessionDay  = null;
        this.currentSessionId  = null;
        this.sessionActive     = false;

        const memberId = Number(this.httpService.getUserId());
        if (memberId && this.activeAssignment) {
          this.loadSummary(memberId, this.activeAssignment.id);
        }

        this.messageService.showSuccess('Session completed!');
      },
      error: () => {
        this.savingSession = false;
        this.messageService.showError('Could not save session. Please try again.');
      }
    });
  }

  cancelSession(): void {
    const sessionId = this.currentSessionId;

    this.sessionActive    = false;
    this.activeSessionDay = null;
    this.currentSessionId = null;
    this.setTrack         = {};
    this.weightTrack      = {};

    // Remove the in-progress session row created when the workout was started,
    // so an abandoned session never counts toward completed days/session stats.
    if (sessionId) {
      this.sessionService.cancelSession(sessionId).subscribe({ error: () => {} });
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  isBodyweightEquipment(equipmentType: string): boolean {
    if (!equipmentType) return false;
    const t = equipmentType.toLowerCase();
    return t === 'bodyweight' || t === 'resistance band';
  }

  get hasTrainer(): boolean {
    return !!this.workoutService.getWorkoutData()?.trainerId;
  }

  private loadTrainerRequestStatus(): void {
    const userId = Number(this.httpService.getUserId());
    this.trainerRequestService.getByMemberId(userId).subscribe({
      next: (request) => { this.trainerRequested = request?.status === 'PENDING'; },
      error: () => { this.trainerRequested = false; }
    });
  }

  requestTrainer(): void {
    const userId = Number(this.httpService.getUserId());
    const payload = {
      memberId: userId,
      memberName: this.memberName,
      level: this.level ?? '',
      goal: this.goal ?? '',
      bmiCategory: this.bmiCategory ?? ''
    };

    this.trainerRequestService.createRequest(payload).subscribe({
      next: () => {
        this.sendManagerNotifications();
        this.trainerRequested = true;
        this.messageService.showSuccess('Request sent to gym management!');
      },
      error: (err) => {
        if (err?.status === 409) {
          this.trainerRequested = true;
        } else {
          this.messageService.showError('Failed to send request. Please try again.');
        }
      }
    });
  }

  private sendManagerNotifications(): void {
    this.userProfileService.getAllUsers().subscribe({
      next: (users: any) => {
        const managers = (users as any[]).filter(u => u.role === 'Manager');
        const msg = `${this.memberName} has requested a trainer assignment. No matching template found for their profile (${this.level}, ${this.formatGoal(this.goal!)}, BMI: ${this.bmiCategory}). Please assign a trainer.`;
        managers.forEach(m => this.notificationService.addNotification(msg, 'warning', m.id, this.memberName));
      },
      error: () => {}
    });
  }

  private notifyTrainerWithMatch(template: WorkoutTemplate): void {
    const workoutData = this.workoutService.getWorkoutData();
    if (!workoutData?.trainerId) return;

    this.assignTrainerService.getTrainerUserId(workoutData.trainerId).subscribe({
      next: (response: any) => {
        const msg = `Workout plan matched for ${this.memberName} — Template: "${template.templateName}", Goal: ${this.formatGoal(this.goal!)}, Level: ${this.level}.`;
        this.notificationService.addNotification(msg, 'info', response.userId, workoutData);
      },
      error: () => {}
    });
  }

  private notifyTrainerNoMatch(): void {
    const workoutData = this.workoutService.getWorkoutData();

    if (workoutData?.trainerId) {
      // Trainer ID already known from in-memory workout data (normal form-submit flow)
      this.dispatchTrainerNoMatchNotification(workoutData.trainerId);
    } else {
      // Fallback: fetch trainer assignment from backend (covers page refresh / direct navigation)
      const loginName = this.httpService.getLoginNameFromCache() ?? '';
      if (!loginName) return;

      this.workoutService.getTrainerById(loginName).subscribe({
        next: (assignment: any) => {
          if (assignment?.trainerId) {
            this.dispatchTrainerNoMatchNotification(assignment.trainerId);
          }
        },
        error: () => {}
      });
    }
  }

  private dispatchTrainerNoMatchNotification(trainerEmployeeId: number): void {
    this.assignTrainerService.getTrainerUserId(trainerEmployeeId).subscribe({
      next: (response: any) => {
        if (!response?.userId) return;
        const message = `No matching template found for ${this.memberName} — ` +
          `Goal: ${this.formatGoal(this.goal!)}, Level: ${this.level}, BMI: ${this.bmiCategory}. ` +
          `A Pending Custom Request has been created. Please create a suitable template.`;
        this.notificationService.addNotification(message, 'warning', response.userId);
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

  goToWorkoutForm(): void {
    this.router.navigate(['/pages/workout']);
  }

  goToProgress(): void {
    this.router.navigate(['/pages/progress-tracking']);
  }
}
