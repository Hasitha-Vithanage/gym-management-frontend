import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { NutritionProfileService } from 'src/app/services/nutrition-and-meal-plans/nutrition-and-meal-plans-service.service';
import { UserMealPlanAssignmentMealService } from 'src/app/services/user-meal-plan-assignment-meal/user-meal-plan-assignment-meal.service';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';
import { TrainerRequestService } from 'src/app/services/trainer-request/trainer-request.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';

@Component({
  selector: 'app-nutrition-and-meal-plan',
  standalone: false,
  templateUrl: './nutrition-and-meal-plan.component.html',
  styleUrl: './nutrition-and-meal-plan.component.scss'
})
export class NutritionAndMealPlanComponent implements OnInit {

  // ─── Top-level view toggle ───────────────────────────────────────────
  activeView: 'myPlans' | 'request' | null = 'myPlans';

  // ─── Nutrition profile form ───────────────────────────────────────────
  hasExistingProfile = false;
  nutritionProfileForm: FormGroup;
  isDisabled = false;
  submitted = false;
  dataSource: any;
  trainerid: any;

  // ─── Trainer assignment gate ──────────────────────────────────────────
  hasTrainer: boolean | null = null;
  trainerRequested = false;
  requestGoal = '';
  requestLevel = '';

  // ─── Active meal plan ─────────────────────────────────────────────────
  isLoadingPlan = false;
  activeAssignment: any = null;
  mealItems: any[] = [];
  currentPlanDay = 1;
  planTab: 'today' | 'week' | 'summary' = 'today';

  readonly mealSlots = ['Breakfast', 'MidMorning', 'Lunch', 'EveningSnack', 'Dinner'];

  readonly allDietaryPrefs = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'High-Protein', 'Low-Carb', 'None'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly nutritionProfileService: NutritionProfileService,
    private readonly messageService: MessageServiceService,
    private readonly assignTrainerService: AssignTrainerServiceService,
    private readonly notificationService: NotificationService,
    private readonly assignmentService: UserMealPlanAssignmentMealService,
    private readonly templateService: MealPlanTemplateService,
    private readonly trainerRequestService: TrainerRequestService,
    private readonly userProfileService: UserProfileService,
    private readonly workoutService: WorkoutManagementService,
    private readonly route: ActivatedRoute
  ) {
    const today = new Date().toISOString().split('T')[0];
    const name = this.http.getLoginNameFromCache();

    this.nutritionProfileForm = this.fb.group({
      userId:             [name, Validators.required],
      submittedDate:      [today, Validators.required],
      fitnessGoal:        ['', Validators.required],
      dietaryPreferences: ['', [Validators.required]],
      allergies:          [''],
      additionalNotes:    ['']
    });
  }

  ngOnInit(): void {
    const requestedView = this.route.snapshot.queryParamMap.get('view');
    if (requestedView === 'request' || requestedView === 'myPlans') {
      this.activeView = requestedView;
    }

    this.checkExistingProfile();
    this.loadActivePlan();
    this.checkHasTrainer();
  }

  // ─── Profile form ─────────────────────────────────────────────────────

  checkExistingProfile(): void {
    const userId = this.http.getLoginNameFromCache();
    this.nutritionProfileService.hasProfile(userId).subscribe({
      next: (exists: boolean) => {
        this.hasExistingProfile = exists;
        if (!exists) { this.prefillGoalFromPriorRequests(); }
      },
      error: () => {
        this.hasExistingProfile = false;
        this.prefillGoalFromPriorRequests();
      }
    });
  }

  /**
   * If the member already stated a fitness goal elsewhere (the workout-matching
   * request, or a trainer request), reuse it here instead of asking them to pick
   * it again from scratch. Workout-side goal values aren't always in the same
   * casing/format as the nutrition dropdown, so everything is normalized first.
   */
  private prefillGoalFromPriorRequests(): void {
    const memberName = this.http.getFullNameFromCache() || this.http.getLoginNameFromCache() || '';
    const userId = Number(this.http.getUserId());

    this.workoutService.getMyLastRequest(memberName).subscribe({
      next: (req: any) => {
        const goal = this.normalizeGoalForNutrition(req?.fitnessGoal);
        if (goal) {
          this.applyGoalPrefill(goal);
        } else {
          this.prefillGoalFromTrainerRequest(userId);
        }
      },
      error: () => this.prefillGoalFromTrainerRequest(userId)
    });
  }

  private prefillGoalFromTrainerRequest(userId: number): void {
    if (!userId) return;
    this.trainerRequestService.getByMemberId(userId).subscribe({
      next: (req) => {
        const goal = this.normalizeGoalForNutrition(req?.goal);
        if (goal) { this.applyGoalPrefill(goal); }
      },
      error: () => {}
    });
  }

  /** Never overwrite a goal the member may have already picked manually while these calls were in flight. */
  private applyGoalPrefill(goal: string): void {
    if (!this.nutritionProfileForm.get('fitnessGoal')?.value) {
      this.nutritionProfileForm.patchValue({ fitnessGoal: goal });
    }
  }

  private normalizeGoalForNutrition(raw: string | null | undefined): string {
    if (!raw) return '';
    const nutritionGoals = ['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'General Health'];
    if (nutritionGoals.includes(raw)) return raw;

    const map: Record<string, string> = {
      fat_loss: 'Fat Loss',
      muscle_gain: 'Muscle Gain',
      strength: 'Strength',
      endurance: 'Endurance',
      general_fitness: 'General Health',
      general_health: 'General Health'
    };
    return map[raw.trim().toLowerCase()] ?? '';
  }

  checkHasTrainer(): void {
    const userId = this.http.getUserId();
    this.assignTrainerService.getTrainerByMemberId(userId).subscribe({
      next: () => { this.hasTrainer = true; },
      error: () => {
        this.hasTrainer = false;
        this.trainerRequestService.getByMemberId(Number(userId)).subscribe({
          next: (req) => { this.trainerRequested = req?.status === 'PENDING'; },
          error: () => { this.trainerRequested = false; }
        });
      }
    });
  }

  requestTrainer(): void {
    if (!this.requestGoal || !this.requestLevel) return;

    const userId = Number(this.http.getUserId());
    const payload = {
      memberId: userId,
      memberName: this.http.getFullNameFromCache() || this.http.getLoginNameFromCache() || '',
      goal: this.requestGoal,
      level: this.requestLevel
    };

    this.trainerRequestService.createRequest(payload).subscribe({
      next: () => {
        this.notifyManagers();
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

  private notifyManagers(): void {
    this.userProfileService.getAllUsers().subscribe({
      next: (users: any) => {
        const managers = (users as any[]).filter(u => u.role === 'Manager');
        const name = this.http.getFullNameFromCache() || this.http.getLoginNameFromCache();
        managers.forEach(m => this.notificationService.addNotification(
          `${name} needs a trainer assigned before they can submit a nutrition profile.`,
          'warning', m.id, name
        ));
      },
      error: () => {}
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.nutritionProfileForm.invalid) return;

    this.nutritionProfileService.submitProfile(this.nutritionProfileForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.dataSource = this.dataSource?.data?.length > 0
          ? new MatTableDataSource([response, ...this.dataSource.data])
          : new MatTableDataSource([response]);

        this.messageService.showSuccess('Nutrition profile submitted successfully!');
        this.hasExistingProfile = true;
        this.nutritionProfileForm.disable();
        this.isDisabled = true;
        this.addNotification();
      },
      error: (error: any) => { this.messageService.showError(error); }
    });
  }

  onReset(): void {
    this.nutritionProfileForm.reset();
    this.submitted = false;
  }

  isDietaryPrefSelected(pref: string): boolean {
    const val: string[] = this.nutritionProfileForm.get('dietaryPreferences')?.value ?? [];
    return val.includes(pref);
  }

  toggleDietaryPref(pref: string): void {
    const ctrl = this.nutritionProfileForm.get('dietaryPreferences')!;
    const val: string[] = [...(ctrl.value ?? [])];
    const idx = val.indexOf(pref);
    if (idx >= 0) val.splice(idx, 1);
    else val.push(pref);
    ctrl.setValue(val);
  }

  addNotification(): void {
    const userId = this.http.getUserId();
    this.assignTrainerService.getTrainerByMemberId(userId).subscribe({
      next: (response: any) => {
        this.trainerid = response.id;
        this.notificationService.addNotification(
          'A member has submitted their nutrition profile',
          'info',
          this.trainerid
        );
      }
    });
  }

  // ─── Active meal plan ─────────────────────────────────────────────────

  loadActivePlan(): void {
    const userId = this.http.getLoginNameFromCache();
    if (!userId) return;

    this.isLoadingPlan = true;
    this.assignmentService.getActiveAssignment(userId).subscribe({
      next: (assignment: any) => {
        if (assignment) {
          this.activeAssignment = assignment;
          this.calculateCurrentDay(assignment.startDate);
          this.loadMealItems(assignment.templateId);
        } else {
          this.isLoadingPlan = false;
        }
      },
      error: () => { this.isLoadingPlan = false; }
    });
  }

  calculateCurrentDay(startDateStr: string): void {
    const start = new Date(startDateStr).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceStart = Math.floor((today.getTime() - start) / msPerDay) + 1;
    this.currentPlanDay = ((daysSinceStart - 1) % 7) + 1;
  }

  loadMealItems(templateId: number): void {
    this.templateService.getMealItems(templateId).subscribe({
      next: (items) => {
        this.mealItems = items;
        this.isLoadingPlan = false;
      },
      error: () => { this.isLoadingPlan = false; }
    });
  }

  // ─── Helper: meal schedule ────────────────────────────────────────────

  get todayItems(): any[] {
    return this.mealItems.filter((i) => Number(i.dayOfWeek) === this.currentPlanDay);
  }

  itemsForSlot(day: number, slot: string): any[] {
    return this.mealItems.filter((i) => Number(i.dayOfWeek) === day && i.mealSlot === slot);
  }

  get usedDays(): number[] {
    return [...new Set(this.mealItems.map((i) => Number(i.dayOfWeek)))].sort((a, b) => a - b);
  }

  slotHasItems(day: number, slot: string): boolean {
    return this.mealItems.some((i) => Number(i.dayOfWeek) === day && i.mealSlot === slot);
  }

  slotLabel(slot: string): string {
    const labels: { [k: string]: string } = {
      Breakfast: 'Breakfast', MidMorning: 'Mid Morning',
      Lunch: 'Lunch', EveningSnack: 'Evening Snack', Dinner: 'Dinner'
    };
    return labels[slot] ?? slot;
  }

  // ─── Nutrition Summary calculations ───────────────────────────────────

  get todayCalories(): number {
    return Math.round(this.todayItems.reduce((s, i) => s + (i.caloriesForPortion ?? 0), 0));
  }

  get todayProtein(): number {
    return Math.round(this.todayItems.reduce((s, i) => s + (i.proteinG ?? 0), 0) * 10) / 10;
  }

  get todayCarbs(): number {
    return Math.round(this.todayItems.reduce((s, i) => s + (i.carbsG ?? 0), 0) * 10) / 10;
  }

  get todayFat(): number {
    return Math.round(this.todayItems.reduce((s, i) => s + (i.fatG ?? 0), 0) * 10) / 10;
  }

  progressPct(actual: number, target: number): number {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
  }

  dayCalories(day: number): number {
    return Math.round(
      this.mealItems
        .filter((i) => Number(i.dayOfWeek) === day)
        .reduce((s, i) => s + (i.caloriesForPortion ?? 0), 0)
    );
  }
}
