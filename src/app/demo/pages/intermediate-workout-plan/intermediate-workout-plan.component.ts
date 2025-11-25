import { Component, OnInit } from '@angular/core';
import { subscribe } from 'diagnostics_channel';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
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
  trainer: any;
  isRequestSent: boolean = false;
  memberName = this.http.getLoginNameFromCache();

  constructor(private workoutService: WorkoutManagementService,
    private httpService: HttpService,
    private messageService: MessageServiceService,
    private http: HttpService,
    private notificationService: NotificationService,
    private assignTrainerService: AssignTrainerServiceService,
  ) { }


  ngOnInit(): void {
    this.userDetails = this.workoutService.getWorkoutData();
    console.log('Received Workout Data:', this.userDetails);

    this.getTrainerById(this.memberName);
  }

  //getMemberById function
  public getTrainerById(memberName: string): void {

    this.workoutService.getTrainerById(memberName).subscribe({
      next: (response) => {
        console.log("response", response);
        this.trainerDetails = response;
        const trainerName = response.trainer;

        this.workoutService.getTrainerDetails(trainerName).subscribe({
          next: (response) => {
            this.trainer = response;
          }
        })
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
        this.addNotification("add");
        this.backToBrowsePage();
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }

  public addNotification(detail): void {

    this.assignTrainerService.getTrainerUserId(this.trainer.id).subscribe({
      next: (response: any) => {
        if (detail === 'add') {
          this.notificationService.addNotification('New workout has been assigned to you', 'info', response.userId);
        }
      },
      error: (error: any) => {
        this.messageService.showError('Error while sending notification to trainer');
      }
    });

  }
}
