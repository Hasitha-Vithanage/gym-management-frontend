import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-assign-trainer-dialog',
  standalone: false,
  templateUrl: './assign-trainer-dialog.component.html',
  styleUrls: ['./assign-trainer-dialog.component.scss']
})
export class AssignTrainerDialogComponent {
  assignTrainerForm: FormGroup;
  registerButtonLabel = 'Assign Trainer';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  dataSource: MatTableDataSource<any>;
  memberList: any[] = [];
  trainerList: any[] = [];
  submitDisabled;
  selectedMember;
  selectedTrainer;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AssignTrainerDialogComponent>,
    private http: HttpService,
    private assignTrainerService: AssignTrainerServiceService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const userName = this.http.getLoginNameFromCache();

    this.assignTrainerForm = new FormGroup({
      member: new FormControl('', [Validators.required]),
      trainer: new FormControl('', [Validators.required])
    });

    // Function for get suppliers
    this.getMembers();
    this.getTrainers();
  }

  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.assignTrainerForm.invalid) {
      return;
    }

    console.log('Clicked');
    console.log(this.assignTrainerForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        const addPayload = { memberId: this.selectedMember, trainerId: this.selectedTrainer };
        this.assignTrainerService.serviceCall(addPayload).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Trainer Assigned successfully!');

            this.addNotification('add');
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        const editPayload = { memberId: this.selectedMember, trainerId: this.selectedTrainer };
        this.assignTrainerService.editData(this.selectedData?.id, editPayload).subscribe({
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

  // getMember function
  public getMembers(): void {
    this.assignTrainerService.getMembers().subscribe({
      next: (response: any[]) => {
        this.memberList = response;
        this.applyPreselectedMember();
      },
      error: (error) => {
        console.log('Error fetching members:', error);
      }
    });
  }

  private applyPreselectedMember(): void {
    const name: string = this.data?.preSelectedMemberName;
    if (!name) return;

    const member = this.memberList.find((m: any) =>
      (`${m.firstName} ${m.lastName}`).trim().toLowerCase() === name.trim().toLowerCase()
    );

    if (member) {
      this.assignTrainerForm.patchValue({ member: member.firstName });
      this.selectedMember = member.id;
    }
  }

  // getMember function
  public getTrainers(): void {
    //Call Service to get trainers
    this.assignTrainerService.getTrainers().subscribe({
      next: (response: any[]) => {
        console.log('Trainers: ', response);
        this.trainerList = response;
      },
      error: (error) => {
        console.log('Error fetching trainers:', error);
      }
    });
  }

  // reset button function
  public resetData(): void {
    this.assignTrainerForm.reset();
    this.assignTrainerForm.setErrors = null;
    this.assignTrainerForm.updateValueAndValidity();
    this.assignTrainerForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Assign Trainer';
  }

  onEdit(data: any): void {
    this.assignTrainerForm.patchValue({
      member: data.member,
      trainer: data.trainer
    });
    this.selectedMember = data.memberId;
    this.selectedTrainer = data.trainerId;
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.assignTrainerForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.assignTrainerForm.valid || this.assignTrainerForm.pristine;
    });
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }

  public addNotification(detail): void {
    const memberObj  = this.memberList.find((m: any) => m.id === this.selectedMember);
    const trainerObj = this.trainerList.find((t: any) => t.id === this.selectedTrainer);
    const memberName  = memberObj  ? `${memberObj.firstName} ${memberObj.lastName}`.trim()  : 'A member';
    const trainerName = trainerObj ? `${trainerObj.firstName} ${trainerObj.lastName}`.trim() : 'Your trainer';

    this.assignTrainerService.getTrainerUserId(this.selectedTrainer).subscribe({
      next: (response: any) => {
        if (detail === 'add') {
          this.notificationService.addNotification(
            `${memberName} has been assigned to you as a new member.`,
            'info',
            response.userId
          );
        }
      },
      error: () => {
        this.messageService.showError('Error while sending notification to trainer');
      }
    });

    this.assignTrainerService.getMemberUserId(this.selectedMember).subscribe({
      next: (response: any) => {
        if (detail === 'add') {
          this.notificationService.addNotification(
            `${trainerName} has been assigned as your personal trainer.`,
            'info',
            response.userId
          );
        }
      },
      error: () => {
        this.messageService.showError('Error while sending notification to member');
      }
    });
  }

  public onMemberSelect(event: any): void {
    const memberName = (event?.target as HTMLSelectElement)?.value ?? event?.value;

    if (memberName) {
      const member = this.memberList.find((item: any) => item.firstName == memberName);
      if (member) {
        this.selectedMember = member.id;
      }
    }
  }

  public onTrainerSelect(event: any): void {
    const trainerName = (event?.target as HTMLSelectElement)?.value ?? event?.value;

    if (trainerName) {
      const trainer = this.trainerList.find((item: any) => item.firstName == trainerName);
      if (trainer) {
        this.selectedTrainer = trainer.id;
      }
    }
  }
}
