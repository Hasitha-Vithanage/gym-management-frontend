import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UserMealPlanAssignmentMealService } from 'src/app/services/user-meal-plan-assignment-meal/user-meal-plan-assignment-meal.service';
import { NutritionProfileService } from 'src/app/services/nutrition-and-meal-plans/nutrition-and-meal-plans-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { HttpService } from 'src/app/services/http.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-assign-meal-plan',
  standalone: false,
  templateUrl: './assign-meal-plan.component.html',
  styleUrl: './assign-meal-plan.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignMealPlanComponent {

  memberUsername = '';
  isLoading = false;
  hasSearched = false;

  memberProfile: any = null;
  suggestions: any[] = [];

  confirmingTemplate: any = null;
  durationWeeks: number = 4;

  constructor(
    private assignmentService: UserMealPlanAssignmentMealService,
    private profileService: NutritionProfileService,
    private messageService: MessageServiceService,
    private httpService: HttpService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  loadSuggestions(): void {
    const username = this.memberUsername.trim();
    if (!username) {
      this.messageService.showError('Please enter a member username.');
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.memberProfile = null;
    this.suggestions = [];
    this.confirmingTemplate = null;
    this.cdr.markForCheck();

    this.profileService.getProfileByUserId(username).subscribe({
      next: (profile) => {
        this.memberProfile = profile;
        this.cdr.markForCheck();
      },
      error: () => {
        this.memberProfile = null;
        this.cdr.markForCheck();
      }
    });

    this.assignmentService.suggestTemplates(username).subscribe({
      next: (data) => {
        this.suggestions = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.messageService.showError(e.message ?? 'Failed to load suggestions.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openConfirm(suggestion: any): void {
    this.confirmingTemplate = suggestion;
    this.durationWeeks = suggestion.template?.durationWeeks ?? 4;
    this.cdr.markForCheck();
  }

  cancelConfirm(): void {
    this.confirmingTemplate = null;
    this.cdr.markForCheck();
  }

  confirmAssign(): void {
    if (!this.confirmingTemplate) return;

    const trainerUsername = this.httpService.getLoginNameFromCache();
    const payload = {
      userId: this.memberUsername.trim(),
      templateId: this.confirmingTemplate.template.id,
      assignedBy: trainerUsername ?? '',
      durationWeeks: this.durationWeeks
    };

    this.assignmentService.createAssignment(payload).subscribe({
      next: () => {
        const templateName = this.confirmingTemplate.template.templateName;
        this.notificationService.addNotification(
          `Your meal plan "${templateName}" has been assigned! Check your Nutrition & Meal Plan section.`,
          'success'
        );
        this.messageService.showSuccess(`Meal plan assigned to ${this.memberUsername} successfully!`);
        this.confirmingTemplate = null;
        this.loadSuggestions();
      },
      error: (e) => {
        this.messageService.showError(e?.error?.message ?? e?.message ?? 'Assignment failed.');
      }
    });
  }

  onUsernameChange(value: string): void {
    if (!value.trim()) {
      this.hasSearched = false;
      this.memberProfile = null;
      this.suggestions = [];
      this.confirmingTemplate = null;
      this.cdr.markForCheck();
    }
  }

  matchBadgeClass(round: string): string {
    if (round === 'Exact') return 'badge-exact';
    if (round === 'GoalOnly') return 'badge-goal';
    return 'badge-all';
  }

  matchLabel(round: string): string {
    if (round === 'Exact') return 'Exact Match';
    if (round === 'GoalOnly') return 'Goal Match';
    return 'General';
  }
}
