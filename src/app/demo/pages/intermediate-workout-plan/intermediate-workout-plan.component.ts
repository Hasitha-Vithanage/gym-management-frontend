import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';

@Component({
  selector: 'app-intermediate-workout-plan',
  standalone: false,
  templateUrl: './intermediate-workout-plan.component.html',
  styleUrl: './intermediate-workout-plan.component.scss'
})
export class IntermediateWorkoutPlanComponent implements OnInit{

userDetails: any;

constructor(private workoutService: WorkoutManagementService,
  private httpService: HttpService,
) {}


  ngOnInit(): void {
     this.userDetails = this.workoutService.getWorkoutData();
    console.log('Received Workout Data:', this.userDetails);

    this.getTrainer();
  }

  getTrainer() {
    const userName = this.httpService.getUserName();
    
     this.workoutService.getTrainerByUserName(userName);
  }
  
  backToBrowsePage(): void {
    window.history.back();
  }

  senRequest(): void {

  }
}
