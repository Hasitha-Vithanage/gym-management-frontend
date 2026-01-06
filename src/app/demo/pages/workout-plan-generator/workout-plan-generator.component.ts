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
  ) {}

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
  async generateWorkoutPlan() {
    // const payload = {
    //   ...this.bodyForm.value,
    //   ...this.goalForm.value,
    //   ...this.lifestyleForm.value
    // };

    // console.log('Workout Plan Input:', payload);

    this.textBuffer = '';
    this.htmlOutput = '';

    const payload = {
      age: this.bodyForm.value.age,
      gender: this.bodyForm.value.gender,
      height: this.bodyForm.value.height,
      weight: this.bodyForm.value.weight,
      fitnessLevel: this.lifestyleForm.value.experience,
      goal: this.goalForm.value.goal,
      equipment: this.lifestyleForm.value.location,
      daysPerWeek: this.lifestyleForm.value.daysPerWeek,
      limitation: this.lifestyleForm.value.limitations
    };

    console.log('Workout Plan Input:', payload);

    const response = await fetch('http://localhost:8080/workout-plan-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let streamBuffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      streamBuffer += decoder.decode(value, { stream: true });
      const lines = streamBuffer.split('\n');
      streamBuffer = lines.pop()!;

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const token = line.replace('data:', '');
          this.appendToken(token);

          // 🔥 Force Angular to update UI
          this.zone.run(() => {
            const cleanText = this.normalizeMarkdown(this.textBuffer);
            console.log('Clean Text:', cleanText);
            const html: any = marked.parse(cleanText);
            console.log('html:', html);
            this.htmlOutput = this.sanitizer.bypassSecurityTrustHtml(html);
            console.log('htmlOutput:', this.htmlOutput);
          });
        }
      }
    }
  }

  private appendToken(token: string) {
    token = token.replace(/\r/g, '');

    // 1. Fix broken hyphen spacing: "5- 10" → "5–10"
    token = token.replace(/-\s+/g, '–');

    // 2. Fix space before punctuation
    token = token.replace(/\s+([.,:;!?])/g, '$1');

    // 3. Fix broken words (letter + space + letter)
    if (this.textBuffer.length > 0 && /[a-zA-Z]$/.test(this.textBuffer) && /^[a-zA-Z]/.test(token)) {
      this.textBuffer += token;
      return;
    }

    // 4. Ensure space between words
    if (this.textBuffer.length > 0 && !this.textBuffer.endsWith(' ') && !token.startsWith(' ') && /^[a-zA-Z0-9]/.test(token)) {
      this.textBuffer += ' ';
    }

    this.textBuffer += token;
  }

  private normalizeMarkdown(text: string): string {
    return (
      text
        // Headings
        .replace(/\*\*\s*(.+?)\s*\*\*/g, '\n\n## $1\n')
        // Bullet points
        .replace(/\*\s+/g, '\n- ')
        // Day headers
        .replace(/Day\s(\d+):/g, '\n\n### Day $1\n')
        // Remove excessive spaces
        .replace(/\s{2,}/g, ' ')
        // Paragraph spacing
        .replace(/\n{3,}/g, '\n\n')
    );
  }

  // private renderMarkdown() {
  //   this.htmlOutput = marked.parse(this.textBuffer);
  // }
}
