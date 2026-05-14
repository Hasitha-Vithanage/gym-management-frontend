import { Component, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  workoutPlan: any;

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
  
  output = '';
  private buffer = '';
  htmlOutput!: SafeHtml;
  private textBuffer = '';

  constructor(
    private fb: FormBuilder,
    private workoutManagementService: WorkoutManagementService,
    private zone: NgZone,
    private sanitizer: DomSanitizer
  ) { }

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
  // async generateWorkoutPlan() {
  //   // const payload = {
  //   //   ...this.bodyForm.value,
  //   //   ...this.goalForm.value,
  //   //   ...this.lifestyleForm.value
  //   // };

  //   // console.log('Workout Plan Input:', payload);

  //   this.textBuffer = '';
  //   this.htmlOutput = '';

  //   const payload = {
  //     age: this.bodyForm.value.age,
  //     gender: this.bodyForm.value.gender,
  //     height: this.bodyForm.value.height,
  //     weight: this.bodyForm.value.weight,
  //     fitnessLevel: this.lifestyleForm.value.experience,
  //     goal: this.goalForm.value.goal,
  //     equipment: this.lifestyleForm.value.location,
  //     daysPerWeek: this.lifestyleForm.value.daysPerWeek,
  //     limitation: this.lifestyleForm.value.limitations
  //   };

  //   console.log('Workout Plan Input:', payload);

  //   const response = await fetch('http://localhost:8080/workout-plan-generate', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   });

  //   const reader = response.body!.getReader();
  //   const decoder = new TextDecoder();
  //   let streamBuffer = '';

  //   while (true) {
  //     const { value, done } = await reader.read();
  //     if (done) break;

  //     streamBuffer += decoder.decode(value, { stream: true });
  //     const lines = streamBuffer.split('\n');
  //     streamBuffer = lines.pop()!;

  //     for (const line of lines) {
  //       if (line.startsWith('data:')) {
  //         const token = line.replace('data:', '');
  //         this.appendToken(token);

  //         // 🔥 Force Angular to update UI
  //         this.zone.run(() => {
  //           const cleanText = this.normalizeMarkdown(this.textBuffer);
  //           console.log('Clean Text:', cleanText);
  //           const html: any = marked.parse(cleanText);
  //           console.log('html:', html);
  //           this.htmlOutput = this.sanitizer.bypassSecurityTrustHtml(html);
  //           console.log('htmlOutput:', this.htmlOutput);
  //         });
  //       }
  //     }
  //   }
  // }

  // private appendToken(token: string) {
  //   token = token.replace(/\r/g, '');

  //   // 1. Fix broken hyphen spacing: "5- 10" → "5–10"
  //   token = token.replace(/-\s+/g, '–');

  //   // 2. Fix space before punctuation
  //   token = token.replace(/\s+([.,:;!?])/g, '$1');

  //   // 3. Fix broken words (letter + space + letter)
  //   if (this.textBuffer.length > 0 && /[a-zA-Z]$/.test(this.textBuffer) && /^[a-zA-Z]/.test(token)) {
  //     this.textBuffer += token;
  //     return;
  //   }

  //   // 4. Ensure space between words
  //   if (this.textBuffer.length > 0 && !this.textBuffer.endsWith(' ') && !token.startsWith(' ') && /^[a-zA-Z0-9]/.test(token)) {
  //     this.textBuffer += ' ';
  //   }

  //   this.textBuffer += token;
  // }

  // private normalizeMarkdown(text: string): string {
  //   return (
  //     text
  //       // Headings
  //       .replace(/\*\*\s*(.+?)\s*\*\*/g, '\n\n## $1\n')
  //       // Bullet points
  //       .replace(/\*\s+/g, '\n- ')
  //       // Day headers
  //       .replace(/Day\s(\d+):/g, '\n\n### Day $1\n')
  //       // Remove excessive spaces
  //       .replace(/\s{2,}/g, ' ')
  //       // Paragraph spacing
  //       .replace(/\n{3,}/g, '\n\n')
  //   );
  // }

  // private renderMarkdown() {
  //   this.htmlOutput = marked.parse(this.textBuffer);
  // }




  // GOAL CONFIGURATION
  GOAL_CONFIG = {
    'fat_loss': {
      reps: [12, 20],
      sets: 3,
      rest: 30,
      cardio: true
    },
    'muscle_gain': {
      reps: [8, 12],
      sets: 4,
      rest: 90,
      cardio: false
    },
    'strength': {
      reps: [3, 6],
      sets: 5,
      rest: 180,
      cardio: false
    },
    'fitness': {
      reps: [10, 15],
      sets: 3,
      rest: 60,
      cardio: true
    }
  };

  // EXERCISE MASTER
  EXERCISES = [
    // Beginner Legs Exercises
    { name: 'Bodyweight Squat', muscle: 'Legs', equipment: 'Home', level: 'Beginner', injuries: ['Knee'] },
    { name: 'Lunges', muscle: 'Legs', equipment: ['Home', 'Gym'], level: 'Beginner', injuries: ['Knee'] },
    { name: 'Glute Bridge', muscle: 'Glutes', equipment: 'Home', level: 'Beginner', injuries: ['Lower Back'] },

    // Beginner Chest Exercises
    { name: 'Push-up', muscle: 'Chest', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder', 'Wrist'] },
    { name: 'Chest Fly (Resistance Band)', muscle: 'Chest', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder'] },
    { name: 'Incline Push-up', muscle: 'Chest', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder', 'Wrist'] },

    // Beginner Back Exercises
    { name: 'Superman', muscle: 'Back', equipment: 'Home', level: 'Beginner', injuries: ['Lower Back'] },
    { name: 'Bird Dog', muscle: 'Back', equipment: 'Home', level: 'Beginner', injuries: ['Lower Back'] },
    { name: 'Wall Angels', muscle: 'Back', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder'] },
    { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Gym', level: 'Beginner', injuries: [] },

    // Beginner Shoulder Exercises
    { name: 'Arm Circles', muscle: 'Shoulders', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder'] },
    { name: 'Wall Push-up', muscle: 'Shoulders', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder', 'Wrist'] },
    { name: 'Shoulder Press (Resistance Band)', muscle: 'Shoulders', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder'] },

    // Beginner Arms Exercises
    { name: 'Tricep Dips (Chair)', muscle: 'Arms', equipment: 'Home', level: 'Beginner', injuries: ['Elbow'] },
    { name: 'Bicep Curl', muscle: 'Arms', equipment: 'Gym', level: 'Beginner', injuries: ['Wrist'] },
    { name: 'Push-up (Wall)', muscle: 'Arms', equipment: 'Home', level: 'Beginner', injuries: ['Shoulder'] },

    // Beginner Core Exercises
    { name: 'Crunches', muscle: 'Core', equipment: 'Home', level: 'Beginner', injuries: ['Neck'] },
    { name: 'Leg Raises', muscle: 'Core', equipment: 'Home', level: 'Beginner', injuries: ['Lower Back'] },
    { name: 'Mountain Climbers', muscle: 'Core', equipment: 'Home', level: 'Beginner', injuries: ['Knee'] },


    // Intermediate Legs Exercises
    { name: 'Leg Press', muscle: 'Legs', equipment: 'Gym', level: 'Intermediate', injuries: ['Knee'] },
    { name: 'Deadlift', muscle: 'Back', equipment: 'Gym', level: 'Intermediate', injuries: ['Lower Back'] },
    { name: 'Squat', muscle: 'Legs', equipment: 'Gym', level: 'Intermediate', injuries: ['Knee', 'Lower Back'] },

    // Intermediate Chest Exercises
    { name: 'Dumbbell Bench Press', muscle: 'Chest', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },
    { name: 'Chest Dip', muscle: 'Chest', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },
    { name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },

    // Intermediate Back Exercises
    { name: 'Dumbbell Row', muscle: 'Back', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },
    { name: 'Pull-up', muscle: 'Back', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },
    { name: 'Seated Cable Row', muscle: 'Back', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },

    // Intermediate Shoulder Exercises
    { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },
    { name: 'Lateral Raise', muscle: 'Shoulders', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },
    { name: 'Front Raise', muscle: 'Shoulders', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },

    // Intermediate Arms Exercises
    { name: 'Tricep Pushdown', muscle: 'Arms', equipment: 'Gym', level: 'Intermediate', injuries: ['Elbow'] },
    { name: 'Hammer Curl', muscle: 'Arms', equipment: 'Gym', level: 'Intermediate', injuries: ['Wrist'] },
    { name: 'Close-Grip Bench Press', muscle: 'Arms', equipment: 'Gym', level: 'Intermediate', injuries: ['Shoulder'] },

    // Intermediate Core Exercises
    { name: 'Plank with Arm Lift', muscle: 'Core', equipment: 'Home', level: 'Intermediate', injuries: ['Lower Back'] },
    { name: 'Russian Twists', muscle: 'Core', equipment: 'Home', level: 'Intermediate', injuries: ['Lower Back'] },
    { name: 'Hanging Leg Raise', muscle: 'Core', equipment: 'Gym', level: 'Intermediate', injuries: ['Lower Back'] },


    // Advanced Legs Exercises
    { name: 'Barbell Back Squat', muscle: 'Legs', equipment: 'Gym', level: 'Advanced', injuries: ['Knee', 'Lower Back'] },
    { name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Gym', level: 'Advanced', injuries: ['Lower Back'] },
    { name: 'Bulgarian Split Squat', muscle: 'Legs', equipment: 'Gym', level: 'Advanced', injuries: ['Knee'] },

    // Advanced Chest Exercises
    { name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },
    { name: 'Weighted Chest Dip', muscle: 'Chest', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },
    { name: 'Incline Barbell Press', muscle: 'Chest', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },

    // Advanced Back Exercises
    { name: 'Barbell Row', muscle: 'Back', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },
    { name: 'Weighted Pull-up', muscle: 'Back', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },
    { name: 'T-Bar Row', muscle: 'Back', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },

    // Advanced Shoulder Exercises
    { name: 'Barbell Overhead Press', muscle: 'Shoulders', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },
    { name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },
    { name: 'Upright Row', muscle: 'Shoulders', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },

    // Advanced Arms Exercises
    { name: 'Skull Crushers', muscle: 'Arms', equipment: 'Gym', level: 'Advanced', injuries: ['Elbow'] },
    { name: 'Concentration Curl', muscle: 'Arms', equipment: 'Gym', level: 'Advanced', injuries: ['Wrist'] },
    { name: 'Weighted Dips', muscle: 'Arms', equipment: 'Gym', level: 'Advanced', injuries: ['Shoulder'] },

    // Advanced Core Exercises
    { name: 'Dragon Flag', muscle: 'Core', equipment: 'Gym', level: 'Advanced', injuries: ['Lower Back'] },
    { name: 'Cable Woodchopper', muscle: 'Core', equipment: 'Gym', level: 'Advanced', injuries: ['Lower Back'] },
    { name: 'Ab Rollout', muscle: 'Core', equipment: 'Gym', level: 'Advanced', injuries: ['Lower Back'] },

    // Cardio Exercises
    { name: 'Running', muscle: 'Cardio', equipment: 'Outdoor', level: 'All', injuries: ['Knee', 'Ankle'] },
    { name: 'Cycling', muscle: 'Cardio', equipment: 'Outdoor', level: 'All', injuries: ['Knee'] },
  ];

  // PAYLOAD BUILDER
  buildPayload() {
    if (this.bodyForm.invalid || this.goalForm.invalid || this.lifestyleForm.invalid) {
      return null;
    }

    return {
      age: this.bodyForm.value.age,
      gender: this.bodyForm.value.gender,
      height: this.bodyForm.value.height,
      weight: this.bodyForm.value.weight,
      fitnessLevel: this.lifestyleForm.value.experience,
      goal: this.goalForm.value.goal,
      equipment: this.lifestyleForm.value.location,
      daysPerWeek: this.lifestyleForm.value.daysPerWeek,
      limitations: this.lifestyleForm.value.limitations || []
    };
  }

  // MAIN GENERATOR
  workoutGenerate(): void {
    const payload = this.buildPayload();
    if (!payload) return;

    switch (payload.fitnessLevel) {
      case 'Beginner':
        this.workoutPlan = this.generateBeginnerPlan(payload);
        break;

      case 'Intermediate':
        this.workoutPlan = this.generateIntermediatePlan(payload);
        break;

      case 'Advanced':
        this.workoutPlan = this.generateAdvancedPlan(payload);
        break;
    }
  }

  // PLAN GENERATORS
  generateBeginnerPlan(payload) {
    let workout = {
      level: 'Beginner',
      duration: '4 weeks',
      split: 'Full Body',
      daysPerWeek: payload.daysPerWeek,
      progression: 'Linear',
      goal: payload.goal,
      workouts: this.buildWorkout(payload),
      notes: 'Beginner-friendly full body routine with safety focus'
    };
    console.log("Workout Created: ", workout);

    return workout;
  }

  generateIntermediatePlan(payload) {
    const split = this.getSplitByDays(payload.daysPerWeek);
    const workout = {
      level: 'Intermediate',
      duration: '4 weeks',
      split,
      daysPerWeek: payload.daysPerWeek,
      progression: 'Periodized',
      goal: payload.goal,
      workouts: this.buildWorkout(payload),
      notes: 'Goal-oriented plan with balanced volume and intensity'
    };
    console.log("Workout Created: ", workout);
    return workout;
  }

  generateAdvancedPlan(payload) {
    const split = this.getSplitByDays(payload.daysPerWeek);
    const workout = {
      level: 'Advanced',
      duration: '4 weeks',
      split,
      daysPerWeek: payload.daysPerWeek,
      progression: 'Undulating Periodization',
      goal: payload.goal,
      workouts: this.buildWorkout(payload),
      notes: 'High-intensity structured program for advanced trainees'
    };
    console.log("Workout Created: ", workout);
    return workout;
  }

  // SPLIT LOGIC
  getSplitByDays(daysPerWeek: number): string {
    if (daysPerWeek <= 3) return 'Full Body';
    if (daysPerWeek === 4) return 'Upper/Lower';
    return 'Push/Pull/Legs';
  }

  // EXERCISE FILTERING
  filterExercises(payload) {
    return this.EXERCISES.filter(ex =>
      ex.equipment === payload.equipment &&
      this.isLevelAllowed(ex.level, payload.fitnessLevel) &&
      !payload.limitations.some(limitation => ex.injuries.includes(limitation))
    );
  }

  isLevelAllowed(exerciseLevel: string, userLevel: string): boolean {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    return levels.indexOf(exerciseLevel) <= levels.indexOf(this.capitalize(userLevel));
  }

  capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // WORKOUT BUILDER
  buildWorkout(payload) {
    const goalConfig = this.GOAL_CONFIG[payload.goal];
    const exercises = this.filterExercises(payload);

    return exercises.slice(0, 5).map(ex => ({
      exercise: ex.name,
      muscle: ex.muscle,
      sets: goalConfig.sets,
      reps: goalConfig.reps,
      restSeconds: goalConfig.rest
    }));
  }







  // generateWorkoutPlan(payload): void {

  //   if (payload.fitnessLevel === 'beginner') {
  //     // Get beginner workout plan for 1 month even the goal is different
  //     // Should consider the injury limitations

  //     // Will gets a one day split that covers full body workout for days that user can train per week
  //   } else if (payload.fitnessLevel === 'intermediate') {
  //     // Get intermediate workout plan for 1 month should consider the gender, age, starting weight, goal, days per week, equipment availability and injury limitations

  //     // Workout split will vary based on the user inputs (Ex: If user can train 3 days per week, it will be like Day 01: Upper Body Day 02: Lower Body Day 03: Full Body 
  //     // If user can train 4 days per week, it will be an upper/lower split. If user can train 5 days per week, it will be a push/pull/legs split.)
  //   } else if (payload.fitnessLevel === 'advanced') {
  //     // Get advanced workout plan for 1 month should consider the gender, age, starting weight, goal, days per week, equipment availability and injury limitations
  //   }

  // }
}
