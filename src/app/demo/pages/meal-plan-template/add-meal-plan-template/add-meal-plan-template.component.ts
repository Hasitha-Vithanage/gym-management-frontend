import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-add-meal-plan-template',
  standalone: false,
  templateUrl: './add-meal-plan-template.component.html',
  styleUrl: './add-meal-plan-template.component.scss'
})
export class AddMealPlanTemplateComponent implements OnInit, OnDestroy {

  templateForm!: FormGroup;
  registerButtonLabel = 'Save';
  mode = 'add';
  selectedData: any;
  submitted = false;

  readonly allGoals = ['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'General Health'];
  readonly allBmiCategories = ['Underweight', 'Normal', 'Overweight', 'Obese'];
  readonly allDietaryTags = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'High-Protein', 'Low-Carb'];

  selectedSuitableGoals: string[] = [];
  selectedBmiCategories: string[] = [];
  selectedDietaryTags: string[] = [];

  private valueChangesSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMealPlanTemplateComponent>,
    private templateService: MealPlanTemplateService,
    private messageService: MessageServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.templateForm = this.fb.group({
      templateName:        ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      description:         ['', Validators.maxLength(500)],
      goal:                ['', Validators.required],
      status:              ['Active', Validators.required],
      durationWeeks:       [4, [Validators.required, Validators.min(1)]],
      dailyCalorieTarget:  [null, [Validators.required, Validators.min(500)]],
      proteinTargetG:      [null, [Validators.required, Validators.min(0)]],
      carbsTargetG:        [null, [Validators.required, Validators.min(0)]],
      fatTargetG:          [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  toggleGoal(goal: string): void {
    const idx = this.selectedSuitableGoals.indexOf(goal);
    if (idx === -1) this.selectedSuitableGoals.push(goal);
    else this.selectedSuitableGoals.splice(idx, 1);
  }

  isGoalSelected(goal: string): boolean {
    return this.selectedSuitableGoals.includes(goal);
  }

  toggleBmi(bmi: string): void {
    const idx = this.selectedBmiCategories.indexOf(bmi);
    if (idx === -1) this.selectedBmiCategories.push(bmi);
    else this.selectedBmiCategories.splice(idx, 1);
  }

  isBmiSelected(bmi: string): boolean {
    return this.selectedBmiCategories.includes(bmi);
  }

  toggleTag(tag: string): void {
    const idx = this.selectedDietaryTags.indexOf(tag);
    if (idx === -1) this.selectedDietaryTags.push(tag);
    else this.selectedDietaryTags.splice(idx, 1);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedDietaryTags.includes(tag);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.templateForm.invalid) return;

    const payload = {
      ...this.templateForm.value,
      suitableGoals: this.selectedSuitableGoals,
      suitableBmiCategories: this.selectedBmiCategories,
      dietaryTags: this.selectedDietaryTags
    };

    if (this.mode === 'add') {
      this.templateService.createTemplate(payload).subscribe({
        next: () => {
          this.messageService.showSuccess('Meal plan template created successfully!');
          this.dialogRef.close({ action: 'add' });
        },
        error: (error) => this.messageService.showError(error)
      });
    } else {
      this.templateService.updateTemplate(this.selectedData.id, payload).subscribe({
        next: () => {
          this.messageService.showSuccess('Template updated successfully!');
          this.dialogRef.close({ action: 'edit' });
        },
        error: (error) => this.messageService.showError(error)
      });
    }
  }

  onEdit(data: any): void {
    this.templateForm.patchValue({
      templateName:       data.templateName,
      description:        data.description ?? '',
      goal:               data.goal,
      status:             data.status,
      durationWeeks:      data.durationWeeks,
      dailyCalorieTarget: data.dailyCalorieTarget,
      proteinTargetG:     data.proteinTargetG,
      carbsTargetG:       data.carbsTargetG,
      fatTargetG:         data.fatTargetG
    });
    this.selectedSuitableGoals = [...(data.suitableGoals ?? [])];
    this.selectedBmiCategories = [...(data.suitableBmiCategories ?? [])];
    this.selectedDietaryTags   = [...(data.dietaryTags ?? [])];

    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;

    this.valueChangesSub?.unsubscribe();
    this.valueChangesSub = this.templateForm.valueChanges.subscribe(() => {});
  }

  resetData(): void {
    this.templateForm.reset({ status: 'Active', durationWeeks: 4 });
    this.selectedSuitableGoals = [];
    this.selectedBmiCategories = [];
    this.selectedDietaryTags   = [];
    this.submitted = false;
    this.registerButtonLabel = 'Save';
    this.mode = 'add';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
