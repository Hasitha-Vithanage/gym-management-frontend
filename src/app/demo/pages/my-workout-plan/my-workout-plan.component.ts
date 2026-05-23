import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutTemplatesService, WorkoutTemplate } from 'src/app/services/workout-templates/workout-templates.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-my-workout-plan',
  standalone: false,
  templateUrl: './my-workout-plan.component.html',
  styleUrl: './my-workout-plan.component.scss'
})
export class MyWorkoutPlanComponent implements OnInit {

  templates: WorkoutTemplate[] = [];
  isLoading = true;
  level: string | null = null;
  goal: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutTemplatesService: WorkoutTemplatesService,
    private messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    this.level = this.route.snapshot.queryParamMap.get('level');
    this.goal  = this.route.snapshot.queryParamMap.get('goal');

    if (!this.level || !this.goal) {
      this.isLoading = false;
      return;
    }

    this.workoutTemplatesService.getTemplatesByFilter(this.level, this.goal).subscribe({
      next: (data) => {
        this.templates = data;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.showError('Could not load workout plans.');
        this.isLoading = false;
      }
    });
  }

  get isBeginner(): boolean {
    return this.level?.toLowerCase() === 'beginner';
  }

  formatGoal(goal: string): string {
    const map: Record<string, string> = {
      muscle_gain: 'Muscle Gain',
      fat_loss: 'Fat Loss',
      general_fitness: 'General Fitness',
      endurance: 'Endurance'
    };
    return map[goal?.toLowerCase()] || goal;
  }

  goToWorkoutForm(): void {
    this.router.navigate(['/pages/workout']);
  }
}
