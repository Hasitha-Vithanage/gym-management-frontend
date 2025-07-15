import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AddClassService } from 'src/app/services/add-class/add-class.service';

export class DateValidator {
  //  static startTimeBeforeEndTimeValidator(control: AbstractControl): ValidatorFn {
  //   return (formGroup: AbstractControl): ValidationErrors | null => {
  //     const startTime = formGroup.get('startTime')?.value;
  //     const endTime = formGroup.get('endTime')?.value;

  //     if (!startTime || !endTime) return null;

  //     const [startHour, startMinute] = startTime.split(':').map(Number);
  //     const [endHour, endMinute] = endTime.split(':').map(Number);

  //     const start = startHour * 60 + startMinute;
  //     const end = endHour * 60 + endMinute;

  //     return start >= end ? { startAfterEnd: true } : null;
  //   };
  // }

static startTimeBeforeEndTimeValidator(formGroup: AbstractControl): ValidationErrors | null {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;
 
    if (!startTime || !endTime) return null;
 
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
 
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
 
    return start >= end ? { startAfterEnd: true } : null;
  }
}

@Component({
  selector: 'app-add-class-dialog',
  standalone: false,
  templateUrl: './add-class-dialog.component.html',
  styleUrl: './add-class-dialog.component.scss'
})
export class AddClassDialogComponent {

  classForm: FormGroup;
  saveButtonLabel = 'Schedule';
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
 {Validators: DateValidator.startTimeBeforeEndTimeValidator});

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

    // Validate form
    if (this.classForm.invalid) {
      return;
    }

    // Prepare payload
    const payload = {
      ...this.classForm.value,
      remainingSlots: this.classForm.value.totalSlots,
      ...(this.mode === 'edit' ? { id: this.selectedData.id } : {})
    };

    console.log('Payload:', this.selectedData);

    try {
      if (this.mode === 'add') {
        this.addClassService.serviceCall(payload).subscribe({
          next: (response: any) => {
            this.messageService.showSuccess('Class Scheduled successfully!');
            this.dialogRef.close({ action: 'add', data: response });
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        this.addClassService.editData(payload.id, payload).subscribe({
          next: (response: any) => {
            this.messageService.showSuccess('Class details updated successfully!');
            this.dialogRef.close({ action: 'edit', data: response });
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }

      this.isDisabled = true;
      this.mode = 'add';
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  // onEdit(data: any): void {
  //   this.classForm.patchValue({
  //     classTitle: data.classTitle,
  //     description: data.description,
  //     date: new Date(data.date),
  //     startTime: data.startTime,
  //     endTime: data.endTime,
  //     conductorName: data.conductorName,
  //     profession: data.profession,
  //     totalSlots: data.totalSlots,
  //     remainingSlots: data.remainingSlots,
  //     fee: data.fee,
  //     status: data.status,
  //   });
  //   this.registerButtonLabel = 'Update';
  //   this.mode = 'edit';
  //   this.selectedData = data;

  //   this.submitDisabled = true;
  //   // patching date values after formatting
  //   this.classForm.patchValue({
  //     joinedDate: new Date(data.joinedDate),
  //     dateOfBirth: new Date(data.dateOfBirth),
  //   });

  //   this.classForm.valueChanges.subscribe(() => {
  //     this.submitDisabled = /* !this.memberForm.valid || */ this.classForm.pristine;
  //   });
  // }


  onEdit(data: any): void {

    this.saveButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;


    this.classForm.patchValue({
      classTitle: data.classTitle,
      description: data.description,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      conductorName: data.conductorName,
      profession: data.profession,
      totalSlots: data.totalSlots,
      remainingSlots: data.remainingSlots,
      fee: data.fee,
      status: data.status,
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
    this.saveButtonLabel = 'Schedule';
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }
}
