import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { NutritionProfileService } from 'src/app/services/nutrition-and-meal-plans/nutrition-and-meal-plans-service.service';

@Component({
  selector: 'app-nutrition-and-meal-plan',
  standalone: false,
  templateUrl: './nutrition-and-meal-plan.component.html',
  styleUrl: './nutrition-and-meal-plan.component.scss'
})
export class NutritionAndMealPlanComponent implements OnInit {

  activeView: 'myPlans' | 'request' | null = null;
  hasExistingProfile = false;
  nutritionProfileForm: FormGroup;
  mode = 'add';
  selectedData: any;
  isDisabled = false;
  submitted = false;
  dataSource: any;
  trainerid: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly nutritionProfileService: NutritionProfileService,
    private readonly messageService: MessageServiceService,
    private readonly assignTrainerService: AssignTrainerServiceService,
    private readonly notificationService: NotificationService,
  ) {
    const today = new Date().toISOString().split('T')[0];
    const name = this.http.getLoginNameFromCache();

    this.nutritionProfileForm = this.fb.group({
      userId: [name, Validators.required],
      submittedDate: [today, Validators.required],
      fitnessGoal: ['', Validators.required],
      dietaryPreferences: [[]],
      allergies: [''],
      additionalNotes: ['']
    });
  }

  ngOnInit(): void {
    this.checkExistingProfile();
  }

  checkExistingProfile(): void {
    const userId = this.http.getLoginNameFromCache();
    this.nutritionProfileService.hasProfile(userId).subscribe({
      next: (exists: boolean) => {
        this.hasExistingProfile = exists;
      },
      error: () => {
        this.hasExistingProfile = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.nutritionProfileForm.invalid) return;

    this.nutritionProfileService.submitProfile(this.nutritionProfileForm.getRawValue()).subscribe({
      next: (response: any) => {
        if (this.dataSource?.data?.length > 0) {
          this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
        } else {
          this.dataSource = new MatTableDataSource([response]);
        }
        this.messageService.showSuccess('Nutrition profile submitted successfully!');
        this.hasExistingProfile = true;
        this.nutritionProfileForm.disable();
        this.isDisabled = true;
        this.addNotification();
      },
      error: (error: any) => {
        this.messageService.showError(error);
      }
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
}
