import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';

@Component({
  selector: 'app-intermediate-workout-plan',
  standalone: false,
  templateUrl: './intermediate-workout-plan.component.html',
  styleUrl: './intermediate-workout-plan.component.scss'
})
export class IntermediateWorkoutPlanComponent implements OnInit {

  userDetails: any;
  trainerDetails: any;
  isRequestSent: boolean = false;
  memberName = this.http.getLoginNameFromCache();

  constructor(private workoutService: WorkoutManagementService,
    private httpService: HttpService,
    private messageService: MessageServiceService,
    private http: HttpService
  ) { }


  ngOnInit(): void {
    this.userDetails = this.workoutService.getWorkoutData();
    console.log('Received Workout Data:', this.userDetails);

    this.getTrainerById();
  }

  //getMemberById function
  public getTrainerById(): void {

    this.workoutService.getTrainerById().subscribe({
      next: (response) => {
        console.log("response", response);
        this.trainerDetails = response;
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }

  backToBrowsePage(): void {
    window.history.back();
  }

  senRequest(): void {
    console.log("Workout");
    

    const requestPayload = {
      userId: this.memberName,
      age: this.userDetails.age,
      weight: this.userDetails.weight,
      height: this.userDetails.height,
      fitnessGoal: this.userDetails.fitnessGoal,
      experienceLevel: this.userDetails.experienceLevel,

      trainerId: this.trainerDetails.id,
    };

    

    this.workoutService.sendWorkoutRequest(requestPayload).subscribe({
      next: (response) => {
        console.log("response", response);
        this.messageService.showSuccess("Request Send Successfully!");
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }
}
