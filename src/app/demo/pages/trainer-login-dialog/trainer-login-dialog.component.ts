import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { TrainerLoginServiceService } from 'src/app/services/trainer-login/trainer-login-service.service';

@Component({
  selector: 'app-trainer-login-dialog',
  standalone: false,
  templateUrl: './trainer-login-dialog.component.html',
  styleUrl: './trainer-login-dialog.component.scss'
})
export class TrainerLoginDialogComponent {

  trainerLoginForm: FormGroup;
  trainerList: any[] = [];
  dataSource: MatTableDataSource<any>;

  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isButtonDisabled = false;
  submitted = false;
  selectedImageUrl;
  isFileSelected = false;
  submitDisabled;
  isDisabled = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private trainerLoginService: TrainerLoginServiceService,
    public dialogRef: MatDialogRef<TrainerLoginDialogComponent>,
    private messageService: MessageServiceService,
  ) { }

  getTrainerName(id: number): string {
    const selected = this.trainerList.find(trainer => trainer.id === id);
    return selected ? `${selected.firstName} ${selected.lastName}` : '';
  }

  ngOnInit(): void {
    this.trainerLoginForm = this.fb.group({
      trainerId: [null, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
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



    onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.trainerLoginForm.invalid) {
      return;
    }

    console.log('Clicked');
    console.log(this.trainerLoginForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        this.trainerLoginService.serviceCall(this.trainerLoginForm.value).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Trainer registered successfully!');

            // this.addNotification(response);
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        // Calling editData function to send the request to the backend
        this.trainerLoginService.editData(this.selectedData?.id, this.trainerLoginForm.value).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // Displaying success message
            this.messageService.showSuccess('Record updated successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
      // this.employeeForm.disable();
      this.isDisabled = true;
      this.mode = 'add';
    } catch (error) {
      this.messageService.showError(error);
    }
    this.closeDialog();
  }


  // login(): void {
  //   if (this.trainerLoginForm.valid) {
  //     const loginData = this.trainerLoginForm.value;
  //     console.log('Login Data:', loginData);
  //     this.trainerLoginService.serviceCall(loginData).subscribe({
  //       next: (response: any) => {
  //         if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
  //           this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
  //         } else {
  //           this.dataSource = new MatTableDataSource([response]);
  //         }
  //         // displaying success message
  //         this.messageService.showSuccess('Trainer Assigned successfully!');
  //         this.trainerLoginForm.reset();

  //         // this.addNotification(response);
  //       },
  //       // Displaying error message
  //       error: (error) => {
  //         this.messageService.showError(error);
  //       }
  //     });
  //   }
  // }

    onEdit(data: any): void {
    this.trainerLoginForm.patchValue({
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      password: data.password,
    });
    this.registerButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;
    this.submitDisabled = true;

    this.trainerLoginForm.valueChanges.subscribe(() => {
    this.submitDisabled = !this.trainerLoginForm.valid || this.trainerLoginForm.pristine;
  });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
