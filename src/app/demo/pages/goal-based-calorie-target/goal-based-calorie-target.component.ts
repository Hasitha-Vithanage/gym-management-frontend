import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-goal-based-calorie-target',
  standalone: false,
  templateUrl: './goal-based-calorie-target.component.html',
  styleUrl: './goal-based-calorie-target.component.scss'
})
export class GoalBasedCalorieTargetComponent {
  currentStep = 1;
  calorieForm: FormGroup;
  result: any = null;

  // Activity factor mapping
  activityFactor: any = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725
  };

  constructor(private fb: FormBuilder) {
    this.calorieForm = this.fb.group({
      age: [null, [Validators.required, Validators.min(10), Validators.max(100)]],
      gender: ['', Validators.required],
      height: [null, [Validators.required, Validators.min(100)]],
      weight: [null, [Validators.required, Validators.min(30)]],
      activity: ['', Validators.required],
      goal: ['', Validators.required]
    });
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStep1Valid(): boolean {
    return !!(
      this.calorieForm.get('age') &&
      this.calorieForm.get('gender') &&
      this.calorieForm.get('height') &&
      this.calorieForm.get('weight')
    );
  }

  calculate() {
    const { age, gender, height, weight, activity, goal } = this.calorieForm.value;
    let bmr;

    // Calculate BMR using Mifflin-St Jeor Equation
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    }
    else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Calculate TDEE
    let tdee = bmr * this.activityFactor[activity];

    // Adjust calories based on goal
    let calories = tdee;
    if (goal === 'loss') {
      calories -= 500;
    }
    else if (goal === 'gain') {
      calories += 400;
    }

    // Macros distribution (protein, carbs, fat)
    const macros: any = {
      loss: { p: 0.4, c: 0.35, f: 0.25 },
      maintain: { p: 0.3, c: 0.4, f: 0.3 },
      gain: { p: 0.25, c: 0.5, f: 0.25 }
    };

    // Calculate macros in grams
    this.result = {
      calories: Math.round(calories),
      protein: Math.round((calories * macros[goal].p) / 4),
      carbs: Math.round((calories * macros[goal].c) / 4),
      fat: Math.round((calories * macros[goal].f) / 9)
    };
  }

  form: any = {
    age: null,
    gender: '',
    height: null,
    weight: null,
    activity: '',
    goal: ''
  };
}
