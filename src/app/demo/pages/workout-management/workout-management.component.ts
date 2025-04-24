import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';


@Component({
  selector: 'app-workout-management',
  standalone: false,
  templateUrl: './workout-management.component.html',
  styleUrl: './workout-management.component.scss'
})
export class WorkoutManagementComponent {

  formGroup: FormGroup;
  @ViewChild('stepper') stepper!: MatStepper;
  currentStep = 1;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      age: ['', [Validators.required, Validators.min(10), Validators.max(100)]],
      weight: ['', [Validators.required, Validators.min(20)]],
      height: ['', [Validators.required, Validators.min(50)]],
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

  //goToNextStep function
  goToNextStep(): void {
    if (this.formGroup.valid) {
      this.currentStep = 2;
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
