import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-workout-plan-generator',
  standalone: false,
  templateUrl: './workout-plan-generator.component.html',
  styleUrl: './workout-plan-generator.component.scss'
})
export class WorkoutPlanGeneratorComponent {
  bodyForm!: FormGroup;
  goalForm!: FormGroup;
  lifestyleForm!: FormGroup;
  bodyFormSubmitted = false;
  lifestyleFormSubmitted = false;

  fitnessGoals = [
    {
      label: 'Lose Fat',
      value: 'fat_loss',
      desc: 'Burn calories and reduce body fat with cardio, HIIT, and full-body workouts.',
      meta: 'Higher calorie burn, shorter rest periods',
      color: '#FF6B6B', // energetic red/orange
      icon: '../../../../assets/images/icon/workout-management-icon.png', // can map to an SVG or icon component
      recommendedSessions: '3–5 sessions/week, 30–45 min each'
    },
    {
      label: 'Build Muscle',
      value: 'muscle_gain',
      desc: 'Increase lean muscle mass using progressive overload and strength-focused routines.',
      meta: 'Hypertrophy-focused, compound lifts',
      color: '#4D96FF', // blue/teal
      icon: '../../../../assets/images/icon/dumbbell-icon-light.png',
      recommendedSessions: '4–5 sessions/week, 45–60 min each'
    },
    {
      label: 'Increase Strength',
      value: 'strength',
      desc: 'Maximize strength with low-rep, high-intensity lifts and heavier weights.',
      meta: 'Low reps, longer rest, heavy weights',
      color: '#6A0DAD', // dark blue/purple
      icon: '../../../../assets/images/icon/barbell-icon-light.png',
      recommendedSessions: '3–4 sessions/week, 60–75 min each'
    },
    {
      label: 'Stay Fit',
      value: 'fitness',
      desc: 'Maintain general health and activity with balanced routines including strength, cardio, and mobility.',
      meta: 'Balanced and sustainable',
      color: '#4CAF50', // green
      icon: '../../../../assets/images/icon/heart-icon-light.png',
      recommendedSessions: '3–4 sessions/week, 30–45 min each'
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.bodyForm = this.fb.group({
      gender: ['', Validators.required],
      age: ['', Validators.required, Validators.min(10), Validators.max(80)],
      height: ['', Validators.required, Validators.min(120), Validators.max(220)],
      weight: ['', Validators.required, Validators.min(30), Validators.max(200)]
    });

    this.goalForm = this.fb.group({
      goal: ['', Validators.required]
    });

    this.lifestyleForm = this.fb.group({
      experience: ['', Validators.required],
      daysPerWeek: [3, Validators.required],
      location: ['gym'],
      limitations: ['']
    });
  }

  bodyFormSubmit(): void {
    this.bodyFormSubmitted = true;
  }

  lifestyleFormSubmit(): void {
    this.lifestyleFormSubmitted = true;
  }

  get selectedGoal() {
  return this.fitnessGoals.find(
    g => g.value === this.goalForm.value.goal
  );
}

  get estimatedSessionDuration(): string | null {
    const goal = this.goalForm.get('goal')?.value;
    const experience = this.lifestyleForm.get('experience')?.value;

    if (!goal || !experience) {
      return null;
    }

    // Default duration
    let duration = 45;

    switch (goal) {
      case 'fat_loss':
        duration = experience === 'beginner' ? 30 : experience === 'intermediate' ? 40 : experience === 'advanced' ? 50 : 45;
        break;

      case 'muscle_gain':
        duration = experience === 'beginner' ? 45 : experience === 'intermediate' ? 50 : experience === 'advanced' ? 70 : 60;
        break;

      case 'strength':
        duration = experience === 'beginner' ? 50 : experience === 'intermediate' ? 60 : experience === 'advanced' ? 90 : 75;
        break;

      case 'fitness':
        duration = experience === 'beginner' ? 30 : experience === 'intermediate' ? 40 : experience === 'advanced' ? 50 : 45;
        break;
    }
    return `${duration} minutes`;
  }

  // Dynamic recommendation of workout days per week
  get recommendedDays(): string | null {
    // Extract form values
    const age = this.bodyForm.get('age')?.value;
    const gender = this.bodyForm.get('gender')?.value;
    const goal = this.goalForm.get('goal')?.value;
    const experience = this.lifestyleForm.get('experience')?.value;

    // Ensure all required values are present
    if (!age || !goal || !experience) {
      return null;
    }

    // Base recommendation
    let minDays = 3;
    let maxDays = 4;

    // Experience level base
    switch (experience) {
      case 'beginner':
        minDays = 2;
        maxDays = 3;
        break;
      case 'intermediate':
        minDays = 3;
        maxDays = 4;
        break;
      case 'advanced':
        minDays = 4;
        maxDays = 6;
        break;
    }

    // Goal adjustment
    if (goal === 'fat_loss') {
      maxDays += 1;
    }

    if (goal === 'strength') {
      maxDays -= 1;
    }

    // Age adjustment
    if (age >= 40) {
      minDays = Math.max(minDays - 1, 2);
      maxDays = Math.max(maxDays - 1, minDays);
    }

    // Gender adjustment (light & realistic)
    if (gender === 'female' && experience === 'beginner') {
      maxDays = Math.min(maxDays, 4);
    }

    // Safety bounds
    minDays = Math.max(minDays, 2);
    maxDays = Math.min(maxDays, 6);

    return minDays === maxDays ? `${minDays} days` : `${minDays}–${maxDays} days`;
  }

  // Handle goal selection
  selectGoal(goal: string): void {
    this.goalForm.patchValue({ goal });
  }

  // Generate workout plan
  generateWorkoutPlan(): void {
    const payload = {
      ...this.bodyForm.value,
      ...this.goalForm.value,
      ...this.lifestyleForm.value
    };

    console.log('Workout Plan Input:', payload);
  }
}
