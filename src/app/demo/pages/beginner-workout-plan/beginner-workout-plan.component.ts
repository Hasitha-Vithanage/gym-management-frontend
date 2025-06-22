import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-beginner-workout-plan',
  standalone: false,
  templateUrl: './beginner-workout-plan.component.html',
  styleUrl: './beginner-workout-plan.component.scss'
})
export class BeginnerWorkoutPlanComponent {
  formGroup: any;
  currentStep: number;
  constructor(private location: Location) { }

  // Beginner workout exercises list
  exercises = [
    {
      number: 1,
      title: 'Bodyweight Squats',
      sets: '3 sets of 12–15 reps',
      tip: 'Keep your chest up and knees tracking over your toes. Go as low as comfortable.'
    },
    {
      number: 2,
      title: 'Standing Calf Raises',
      sets: '3 sets of 15–20 reps',
      tip: 'Stand tall and lift your heels slowly. Pause and squeeze calves at the top.'
    },
    {
      number: 3,
      title: 'Wall Push-ups',
      sets: '3 sets of 10–12 reps',
      tip: 'Keep your body in a straight line. Move slow and controlled to engage chest and triceps.'
    },
    {
      number: 4,
      title: 'Bench Press',
      sets: '3 sets of 8–10 reps',
      tip: 'Lower the bar (or dumbbells) to your chest with control, then press up while engaging your chest.'
    },
    {
      number: 5,
      title: 'Shoulder Press',
      sets: '3 sets of 10–12 reps',
      tip: 'Press weights straight up without arching your back. Keep core tight and elbows slightly in.'
    },
    {
      number: 6,
      title: 'Bent-Over Arm Rows',
      sets: '3 sets of 12 reps',
      tip: 'Bend at hips, keep back flat. Pull elbows back and squeeze your shoulder blades together.'
    },
    {
      number: 7,
      title: 'Overhead Pushdown',
      sets: '3 sets of 10–12 reps',
      tip: 'Use a band or cable, keep elbows tight near your head, and extend arms fully.'
    },
    {
      number: 8,
      title: 'Bicep Curls',
      sets: '3 sets of 12–15 reps',
      tip: 'Keep elbows pinned to your sides and curl slowly. Don’t swing the weights.'
    },
    {
      number: 9,
      title: 'Wrist Curls',
      sets: '3 sets of 15 reps',
      tip: 'Rest your forearms on your thighs or bench. Move only your wrists while curling.'
    }
  ];

  backButton() : void {
    
  }
}

