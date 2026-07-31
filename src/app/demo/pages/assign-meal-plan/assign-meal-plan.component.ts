import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserMealPlanAssignmentMealService } from 'src/app/services/user-meal-plan-assignment-meal/user-meal-plan-assignment-meal.service';
import { NutritionProfileService } from 'src/app/services/nutrition-and-meal-plans/nutrition-and-meal-plans-service.service';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';
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
export class AssignMealPlanComponent implements OnInit {

  memberUsername = '';
  isLoading = false;
  hasSearched = false;

  memberProfile: any = null;
  currentAssignment: any = null;
  suggestions: any[] = [];
  otherTemplates: any[] = [];

  confirmingTemplate: any = null;
  durationWeeks: number = 4;

  // Pending nutrition request context (set when navigated from Pending Nutrition Requests page)
  pendingRequestId: string | null = null;
  pendingMemberUserId: number | null = null;

  constructor(
    private assignmentService: UserMealPlanAssignmentMealService,
    private profileService: NutritionProfileService,
    private templateService: MealPlanTemplateService,
    private messageService: MessageServiceService,
    private httpService: HttpService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.pendingRequestId = this.route.snapshot.queryParamMap.get('pendingRequestId');
    this.pendingMemberUserId = Number(this.route.snapshot.queryParamMap.get('memberUserId')) || null;

    const prefillName = this.route.snapshot.queryParamMap.get('memberName');
    if (prefillName) {
      this.memberUsername = prefillName;
      this.loadSuggestions();
    }
  }

  loadSuggestions(): void {
    const username = this.memberUsername.trim();
    if (!username) {
      this.messageService.showError('Please enter a member username.');
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.memberProfile = null;
    this.currentAssignment = null;
    this.suggestions = [];
    this.otherTemplates = [];
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

    this.assignmentService.getActiveAssignment(username).subscribe({
      next: (assignment) => {
        this.currentAssignment = assignment;
        this.cdr.markForCheck();
      },
      error: () => {
        this.currentAssignment = null;
        this.cdr.markForCheck();
      }
    });

    this.assignmentService.suggestTemplates(username).subscribe({
      next: (data) => {
        this.suggestions = data;
        this.loadOtherTemplates();
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

  /**
   * Suggestions only surface templates that match the member's profile. Trainers may
   * still want to assign something else, so every remaining active template is loaded
   * separately as "Other Templates" rather than left completely unreachable here.
   */
  private loadOtherTemplates(): void {
    this.templateService.getAllTemplates().subscribe({
      next: (allTemplates) => {
        const suggestedIds = new Set(this.suggestions.map((s) => s.template?.id));
        this.otherTemplates = allTemplates
          .filter((t) => t.status === 'Active' && !suggestedIds.has(t.id))
          .map((t) => ({ template: t, matchRound: 'Other', matchReason: '', matchScore: 0 }));
        this.cdr.markForCheck();
      },
      error: () => {}
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
          'success',
          this.pendingMemberUserId ?? undefined
        );

        if (this.pendingRequestId) {
          this.profileService.updateStatusByUserId(this.memberUsername.trim(), 'Assigned')
            .subscribe({ error: () => {} });
        }

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
      this.currentAssignment = null;
      this.suggestions = [];
      this.otherTemplates = [];
      this.confirmingTemplate = null;
      this.cdr.markForCheck();
    }
  }

  matchBadgeClass(round: string): string {
    if (round === 'Exact') return 'badge-exact';
    if (round === 'GoalOnly') return 'badge-goal';
    if (round === 'Other') return 'badge-other';
    return 'badge-all';
  }

  matchLabel(round: string): string {
    if (round === 'Exact') return 'Exact Match';
    if (round === 'GoalOnly') return 'Goal Match';
    if (round === 'Other') return 'Other Template';
    return 'General';
  }
}
