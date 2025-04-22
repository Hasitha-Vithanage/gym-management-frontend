import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

interface BmiCategory {
  name: string;
  range: string;
  color: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-workout-management',
  standalone: false,
  templateUrl: './workout-management.component.html',
  styleUrl: './workout-management.component.scss'
})
export class WorkoutManagementComponent implements OnInit, OnChanges{

  bmiForm: FormGroup;
  bmiValue: number = 0;
  bmiCategory: string = '';
  bmiCategoryColor: string = '';
  showResult: boolean = false;
  metricUnits: boolean = true;

  bmiCategories: BmiCategory[] = [
    { name: 'Underweight', range: 'Less than 18.5', color: '#5bc0de', min: 0, max: 18.5 },
    { name: 'Normal weight', range: '18.5 - 24.9', color: '#5cb85c', min: 18.5, max: 25 },
    { name: 'Overweight', range: '25 - 29.9', color: '#f0ad4e', min: 25, max: 30 },
    { name: 'Obesity', range: '30 or greater', color: '#d9534f', min: 30, max: 100 }
  ];

  constructor(private fb: FormBuilder) {
    this.bmiForm = this.fb.group({
      weight: ['', [Validators.required, Validators.min(0)]],
      height: ['', [Validators.required, Validators.min(0)]]
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {}

  calculateBMI(): void {
    if (this.bmiForm.valid) {
      const weight = this.bmiForm.value.weight;
      const height = this.bmiForm.value.height;

      if (this.metricUnits) {
        // Metric: weight in kg, height in cm
        this.bmiValue = weight / Math.pow(height / 100, 2);
      } else {
        // Imperial: weight in lbs, height in inches
        this.bmiValue = (weight * 703) / Math.pow(height, 2);
      }

      this.setBmiCategory();
      this.showResult = true;
    }
  }

  setBmiCategory(): void {
    for (const category of this.bmiCategories) {
      if (this.bmiValue >= category.min && this.bmiValue < category.max) {
        this.bmiCategory = category.name;
        this.bmiCategoryColor = category.color;
        return;
      }
    }
    
    // For extremely high BMI values
    if (this.bmiValue >= 100) {
      this.bmiCategory = 'Obesity';
      this.bmiCategoryColor = '#d9534f';
    }
  }

  resetCalculator(): void {
    this.bmiForm.reset();
    this.showResult = false;
  }

  toggleUnits(): void {
    this.metricUnits = !this.metricUnits;
    this.resetCalculator();
  }

  getPointerPosition(): string {
    // Position pointer on the chart based on BMI value
    if (this.bmiValue < 0) return '0%';
    if (this.bmiValue > 40) return '100%';
    
    // Map BMI range 0-40 to 0-100% for positioning
    return (this.bmiValue * 2.5) + '%';
  }
  
}
