import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AddClassService } from 'src/app/services/add-class/add-class.service';

@Component({
  selector: 'app-add-class-dialog',
  standalone: false,
  templateUrl: './add-class-dialog.component.html',
  styleUrl: './add-class-dialog.component.scss'
})
export class AddClassDialogComponent {

  classForm: FormGroup;
  registerButtonLabel = 'Schedule';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  dataSource: MatTableDataSource<any>;
  today: Date = new Date();
  submitDisabled;


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddClassDialogComponent>,
    private http: HttpService,
    private addClassService: AddClassService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const userName = this.http.getLoginNameFromCache();

    this.classForm = this.fb.group({
      classTitle: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      date: ['', [Validators.required, this.futureDateValidator]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      conductorName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s.'-]+$/)]],
      profession: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s&-]+$/)]],
      totalSlots: ['', [Validators.required, Validators.min(1), Validators.max(25), Validators.pattern(/^[0-9]+$/)]],
      fee: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      status: ['', [Validators.required]],
    },
  {
      validators: this.startTimeBeforeEndTimeValidator()
  });
  }

  startTimeBeforeEndTimeValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startTime = formGroup.get('startTime')?.value;
      const endTime = formGroup.get('endTime')?.value;

      if (!startTime || !endTime) return null;

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;

      return start >= end ? { startAfterEnd: true } : null;
    };
  }


  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today ? { futureDate: true } : null;
  }


  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.classForm.invalid) {
      return;
    }

      const payload = {
    ...this.classForm.value,
    remainingSlots: this.classForm.value.totalSlots
  };

  console.log("Payload: ", payload);
  

    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        this.addClassService.serviceCall(payload).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Class Scheduled successfully!');
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        // Calling editData function to send the request to the backend
        this.addClassService.editData(this.selectedData?.id, this.classForm.value).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // Displaying success message
            this.messageService.showSuccess('Class details updated successfully!');
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

  onEdit(data: any): void {
    this.classForm.patchValue({
      classTitle: data.classTitle,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      conductorName: data.conductorName,
      profession: data.profession,
      totalSlots: data.totalSlots,
      remainingSlots: data.remainingSlots,
      address: data.address,
      fee: data.fee,
      status: data.status,
    });
    this.registerButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;

    this.submitDisabled = true;

    // patching date values after formatting
    this.classForm.patchValue({
      date: new Date(data.date),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });

    this.classForm.valueChanges.subscribe(() => {
      this.submitDisabled = /* !this.employeeForm.valid || */ this.classForm.pristine;
    });
  }

  // reset button function
  public resetData(): void {
    this.classForm.reset();
    this.classForm.setErrors = null;
    this.classForm.updateValueAndValidity();
    this.classForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Register';
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }
}
