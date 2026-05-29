import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { UserWorkoutAssignmentService, UserWorkoutAssignment } from 'src/app/services/user-workout-assignment/user-workout-assignment.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { TrainerRequestService } from 'src/app/services/trainer-request/trainer-request.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';

@Component({
  selector: 'app-workout-management',
  standalone: false,
  templateUrl: './workout-management.component.html',
  styleUrl: './workout-management.component.scss'
})
export class WorkoutManagementComponent implements OnInit {

  formGroup!: FormGroup;
  submitted = false;
  step: 'form' | 'confirm' = 'form';

  bmi = 0;
  bmiCategory = '';

  trainerDetails: any = null;
  trainer: any = null;
  isLoading = false;
  trainerRequested = false;

  memberName!: string;
  activeAssignment: UserWorkoutAssignment | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private workoutService: WorkoutManagementService,
    private httpService: HttpService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    private assignTrainerService: AssignTrainerServiceService,
    private assignmentService: UserWorkoutAssignmentService,
    private userProfileService: UserProfileService,
    private trainerRequestService: TrainerRequestService,
    private memberService: MemberServiceService
  ) {}

  ngOnInit(): void {
    this.memberName = this.httpService.getFullNameFromCache() || this.httpService.getLoginNameFromCache() || '';

    const userId = Number(this.httpService.getUserId());
    if (userId) {
      this.assignmentService.getActiveAssignment(userId).subscribe({
        next: (assignment) => { this.activeAssignment = assignment; },
        error: () => {}
      });
    }
    this.formGroup = this.fb.group({
      age: ['', [Validators.required, Validators.min(10), Validators.max(100)]],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      height: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      fitnessGoal: ['', Validators.required],
      experienceLevel: ['', Validators.required],
      gender: ['', Validators.required]
    });

    this.formGroup.valueChanges.subscribe(() => {
      if (this.formGroup.valid) this.calculateBMI();
    });

    // ── Auto-fill from member profile (age, gender) ──────────────────────────
    if (userId) {
      this.memberService.getUserById(userId).subscribe({
        next: (userData: any) => {
          if (userData?.customerLoginId) {
            this.memberService.getMemberById(userData.customerLoginId).subscribe({
              next: (memberData: any) => {
                const patch: any = {};
                if (memberData?.dateOfBirth) patch.age = this.calculateAge(memberData.dateOfBirth);
                if (memberData?.gender) {
                  const g: string = memberData.gender;
                  patch.gender = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
                }
                if (Object.keys(patch).length) this.formGroup.patchValue(patch);
              },
              error: () => {}
            });
          }
        },
        error: () => {}
      });
    }

    // ── Auto-fill weight + height from last workout request ───────────────────
    if (this.memberName) {
      this.workoutService.getMyLastRequest(this.memberName).subscribe({
        next: (lastRequest: any) => {
          if (lastRequest) {
            const patch: any = {};
            if (lastRequest.weight) patch.weight = lastRequest.weight;
            if (lastRequest.height) patch.height = lastRequest.height;
            if (Object.keys(patch).length) this.formGroup.patchValue(patch);
          }
        },
        error: () => {}
      });
    }
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  proceedToConfirm(): void {
    this.submitted = true;
    if (!this.formGroup.valid) return;

    this.calculateBMI();
    this.isLoading = true;

    this.workoutService.getTrainerById(this.memberName).subscribe({
      next: (response) => {
        this.trainerDetails = response;
        this.workoutService.getTrainerDetails(response.trainerId).subscribe({
          next: (trainerData) => {
            this.trainer = trainerData;
            // Trainer is now assigned — mark any pending request as ASSIGNED
            const userId = Number(this.httpService.getUserId());
            this.trainerRequestService.updateStatus(userId, 'ASSIGNED').subscribe({ error: () => {} });
            this.trainerRequested = false;
            this.isLoading = false;
            this.step = 'confirm';
          },
          error: () => {
            this.loadTrainerRequestStatus();
          }
        });
      },
      error: () => {
        this.loadTrainerRequestStatus();
      }
    });
  }

  private loadTrainerRequestStatus(): void {
    const userId = Number(this.httpService.getUserId());
    this.trainerRequestService.getByMemberId(userId).subscribe({
      next: (request) => {
        this.trainerRequested = request?.status === 'PENDING';
        this.isLoading = false;
        this.step = 'confirm';
      },
      error: () => {
        this.trainerRequested = false;
        this.isLoading = false;
        this.step = 'confirm';
      }
    });
  }

  requestTrainer(): void {
    const userId = Number(this.httpService.getUserId());
    const payload = {
      memberId: userId,
      memberName: this.memberName,
      level: this.formGroup.value.experienceLevel,
      goal: this.formGroup.value.fitnessGoal,
      bmiCategory: this.bmiCategory
    };

    this.trainerRequestService.createRequest(payload).subscribe({
      next: () => {
        this.sendManagerNotifications();
        this.trainerRequested = true;
        this.messageService.showSuccess('Request sent to gym management!');
      },
      error: (err) => {
        // 409 = duplicate request already exists
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
        const msg = `${this.memberName} has requested a trainer assignment. Please assign a trainer to this member.`;
        managers.forEach(manager => this.notificationService.addNotification(msg, 'info', manager.id, this.memberName));
      },
      error: () => {}
    });
  }

  backToForm(): void {
    this.step = 'form';
  }

  goToMyPlan(): void {
    this.submitWorkoutRequest(() => {
      this.workoutService.setWorkoutData({
        ...this.formGroup.value,
        bmi: this.bmi,
        bmiCategory: this.bmiCategory,
        memberName: this.memberName,
        trainerId: this.trainer?.id ?? null
      });
      this.router.navigate(['/pages/my-workout-plan'], {
        queryParams: {
          level: this.formGroup.value.experienceLevel,
          goal: this.formGroup.value.fitnessGoal,
          gender: this.formGroup.value.gender,
          bmiCategory: this.bmiCategory,
          age: this.formGroup.value.age
        }
      });
    });
  }

  private submitWorkoutRequest(onSuccess: () => void): void {
    const payload = {
      userId: this.memberName,
      age: this.formGroup.value.age,
      weight: this.formGroup.value.weight,
      height: this.formGroup.value.height,
      fitnessGoal: this.formGroup.value.fitnessGoal,
      experienceLevel: this.formGroup.value.experienceLevel,
      trainerId: this.trainerDetails?.id ?? null
    };

    this.workoutService.sendWorkoutRequest(payload).subscribe({
      next: () => onSuccess(),
      error: (error) => this.messageService.showError(error)
    });
  }

  private notifyTrainer(): void {
    const memberProfile = {
      name: this.memberName,
      age: this.formGroup.value.age,
      weight: this.formGroup.value.weight,
      height: this.formGroup.value.height,
      gender: this.formGroup.value.gender,
      goal: this.formatGoal(this.formGroup.value.fitnessGoal),
      level: this.formGroup.value.experienceLevel,
      bmi: this.bmi,
      bmiCategory: this.bmiCategory
    };
    const message = `Workout plan request from ${this.memberName} — ${memberProfile.goal}, ${memberProfile.level}, BMI: ${memberProfile.bmiCategory} (${this.bmi})`;

    this.assignTrainerService.getTrainerUserId(this.trainer.id).subscribe({
      next: (response: any) => {
        this.notificationService.addNotification(message, 'info', response.userId, memberProfile);
      },
      error: () => {}
    });
  }

  get activePlanEndLabel(): string {
    if (!this.activeAssignment) return '';
    if (!this.activeAssignment.endDate) return 'ongoing (no fixed end date)';
    const d = new Date(this.activeAssignment.endDate);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  calculateBMI(): void {
    const weight = this.formGroup.get('weight')?.value;
    const height = this.formGroup.get('height')?.value;
    if (weight && height) {
      const heightM = height / 100;
      this.bmi = +(weight / (heightM * heightM)).toFixed(1);
      this.bmiCategory = this.getBMICategory(this.bmi);
    }
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 24.9) return 'Normal';
    if (bmi < 29.9) return 'Overweight';
    return 'Obese';
  }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.formGroup.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
  }

  formatGoal(goal: string): string {
    const map: Record<string, string> = {
      muscle_gain: 'Muscle Gain',
      fat_loss: 'Fat Loss',
      strength: 'Strength',
      endurance: 'Endurance'
    };
    return map[goal] || goal;
  }
}
