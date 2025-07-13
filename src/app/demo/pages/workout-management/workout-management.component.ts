import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';


@Component({
  selector: 'app-workout-management',
  standalone: false,
  templateUrl: './workout-management.component.html',
  styleUrl: './workout-management.component.scss'
})
export class WorkoutManagementComponent {

  formGroup: FormGroup;
  @ViewChild('stepper') stepper!: MatStepper;
  submitted = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private workoutService: WorkoutManagementService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      age: ['', [Validators.required, Validators.min(10), Validators.max(100)]],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      height: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      fitnessGoal: ['', Validators.required],
      experienceLevel: ['', Validators.required]
    });

    // calling calculateBMI function
    this.formGroup.valueChanges.subscribe(() => {
      if (this.formGroup.valid) {
        this.calculateBMI();
      }
    });
  }

  viewDetails(supplement: any): void {
    this.submitted = true;
    // Navigate to the supplement details page with the selected supplement's ID
    console.log('Viewing supplement:', supplement);
    if (this.formGroup.valid) {
      if (this.formGroup.get('experienceLevel').value === 'Beginner') {
        this.router.navigate(['/pages/beginner-workout-plan']);
      } else if (this.formGroup.get('experienceLevel').value === 'Intermediate') {
        this.workoutService.setWorkoutData(this.formGroup.value);
        this.router.navigate(['/pages/intermediate-workout-plan']);
      }
    }

  }

  // mapping goal to the strings
  formatGoal(goal: string): string {
    const map: Record<string, string> = {
      muscle_gain: 'Muscle Gain 💪',
      fat_loss: 'Fat Loss 🔥',
      general_fitness: 'General Fitness ⚡',
      endurance: 'Endurance 🏃'
    };
    return map[goal] || goal;
  }


  // BMI calculation
  bmi: number = 0;
  bmiCategory: string = '';
  formCompleted = false;

  calculateBMI() {
    const weight = this.formGroup.get('weight')?.value;
    const height = this.formGroup.get('height')?.value;

    if (weight && height) {
      const heightInMeters = height / 100;
      this.bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(1);
      this.bmiCategory = this.getBMICategory(this.bmi);
      this.formCompleted = this.formGroup.valid;
    }
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 24.9) return 'Normal';
    if (bmi < 29.9) return 'Overweight';
    return 'Obese';
  }

  getBMIColor(category: string): 'primary' | 'accent' | 'warn' {
    switch (category.toLowerCase()) {
      case 'underweight':
        return 'primary';
      case 'normal':
        return 'accent';
      case 'overweight':
      case 'obese':
        return 'warn';
      default:
        return 'primary';
    }
  }

}
