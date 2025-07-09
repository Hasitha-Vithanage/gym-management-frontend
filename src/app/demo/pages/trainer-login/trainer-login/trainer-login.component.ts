import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { on } from 'events';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { TrainerLoginServiceService } from 'src/app/services/trainer-login/trainer-login-service.service';

@Component({
  selector: 'app-trainer-login',
  standalone: false,
  templateUrl: './trainer-login.component.html',
  styleUrl: './trainer-login.component.scss'
})
export class TrainerLoginComponent implements OnInit {

  trainerLoginForm: FormGroup;
  trainerList: any[] = [];
  dataSource: MatTableDataSource<any>;

  constructor(private fb: FormBuilder,
    private router: Router,
    private trainerLoginService: TrainerLoginServiceService,
    private messageService: MessageServiceService,
  ) { }

  ngOnInit(): void {
    this.trainerLoginForm = this.fb.group({
      trainerId: [null, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.getTrainers();


      // Set firstName and lastName when a trainer is selected
  this.trainerLoginForm.get('trainerId')?.valueChanges.subscribe((selectedId) => {
    const selectedTrainer = this.trainerList.find(t => t.id === selectedId);
    if (selectedTrainer) {
      this.trainerLoginForm.patchValue({
        firstName: selectedTrainer.firstName || '',
        lastName: selectedTrainer.lastName || ''
      });
    } else {
      this.trainerLoginForm.patchValue({ firstName: '', lastName: '' });
    }
  });
  }

  // getMember function
  public getTrainers(): void {
    //Call Service to get trainers
    this.trainerLoginService.getTrainers().subscribe({
      next: (response: any[]) => {
        console.log("Trainers: ", response);
        this.trainerList = response;
      },
      error: (error) => {
        console.log('Error fetching trainers:', error);
      }
    });
  }


  

  login(): void {
    if (this.trainerLoginForm.valid) {
      const loginData = this.trainerLoginForm.value;
      console.log('Login Data:', loginData);
      this.trainerLoginService.serviceCall(loginData).subscribe({
        next: (response: any) => {
          if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
            this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
          } else {
            this.dataSource = new MatTableDataSource([response]);
          }
          // displaying success message
          this.messageService.showSuccess('Trainer Assigned successfully!');

          // this.addNotification(response);
        },
        // Displaying error message
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    }
  }
}
