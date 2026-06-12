import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { NutritionProfileService } from 'src/app/services/nutrition-and-meal-plans/nutrition-and-meal-plans-service.service';
import { UserMealPlanAssignmentMealService } from 'src/app/services/user-meal-plan-assignment-meal/user-meal-plan-assignment-meal.service';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';

@Component({
  selector: 'app-nutrition-and-meal-plan',
  standalone: false,
  templateUrl: './nutrition-and-meal-plan.component.html',
  styleUrl: './nutrition-and-meal-plan.component.scss'
})
export class NutritionAndMealPlanComponent implements OnInit {

  // ─── Top-level view toggle ───────────────────────────────────────────
  activeView: 'myPlans' | 'request' | null = null;

  // ─── Nutrition profile form ───────────────────────────────────────────
  hasExistingProfile = false;
  nutritionProfileForm: FormGroup;
  isDisabled = false;
  submitted = false;
  dataSource: any;
  trainerid: any;

  // ─── Active meal plan ─────────────────────────────────────────────────
  isLoadingPlan = false;
  activeAssignment: any = null;
  mealItems: any[] = [];
  currentPlanDay = 1;
  planTab: 'today' | 'week' | 'summary' = 'today';

  readonly mealSlots = ['Breakfast', 'MidMorning', 'Lunch', 'EveningSnack', 'Dinner'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly nutritionProfileService: NutritionProfileService,
    private readonly messageService: MessageServiceService,
    private readonly assignTrainerService: AssignTrainerServiceService,
    private readonly notificationService: NotificationService,
    private readonly assignmentService: UserMealPlanAssignmentMealService,
    private readonly templateService: MealPlanTemplateService
  ) {
    const today = new Date().toISOString().split('T')[0];
    const name = this.http.getLoginNameFromCache();

    this.nutritionProfileForm = this.fb.group({
      userId:             [name, Validators.required],
      submittedDate:      [today, Validators.required],
      fitnessGoal:        ['', Validators.required],
      dietaryPreferences: [[]],
      allergies:          [''],
      additionalNotes:    ['']
    });
  }

  ngOnInit(): void {
    this.checkExistingProfile();
    this.loadActivePlan();
  }

  // ─── Profile form ─────────────────────────────────────────────────────

  checkExistingProfile(): void {
    const userId = this.http.getLoginNameFromCache();
    this.nutritionProfileService.hasProfile(userId).subscribe({
      next: (exists: boolean) => { this.hasExistingProfile = exists; },
      error: () => { this.hasExistingProfile = false; }
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
