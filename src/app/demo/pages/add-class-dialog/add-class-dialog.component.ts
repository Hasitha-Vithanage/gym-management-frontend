import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { AddClassService } from 'src/app/services/add-class/add-class.service';
import moment from 'moment';

export const startTimeBeforeEndTimeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  if (!startTime || !endTime) return null;

  const start = convertToDate(startTime);
  const end = convertToDate(endTime);

  return end <= start ? { startTimeBeforeEndTimeValidator: true } : null;
};

function convertToDate(time: string | number[] | Date): Date {
  if (Array.isArray(time)) {
    // if input is like [10, 30]
    return new Date(0, 0, 0, time[0], time[1]);
  }
  if (typeof time === 'string') {
    // if input is like "10:30"
    const [hour, minute] = time.split(':').map(Number);
    return new Date(0, 0, 0, hour, minute);
  }
  return new Date(time);
}

export const futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const inputDate = control.value;
  console.log('futureDateValidator called:', { inputDate, type: typeof inputDate }); // Debug log

  if (!inputDate) {
    return null; // Don't validate if empty (let required validator handle this)
  }

  // Convert input to Date object
  let selectedDate: Date;
  if (typeof inputDate === 'string') {
    // Handle YYYY-MM-DD format (common for <input type="date">)
    selectedDate = new Date(inputDate);
  } else if (inputDate instanceof Date) {
    selectedDate = inputDate;
  } else {
    console.warn('Unexpected date format:', inputDate);
    return { invalidDate: true }; // Invalid format
  }

  if (Number.isNaN(selectedDate.getTime())) {
    console.warn('Invalid date object:', selectedDate);
    return { invalidDate: true }; // Invalid date
  }

  // Normalize to midnight for date-only comparison
  selectedDate.setHours(0, 0, 0, 0);

  // Get today's date, normalized to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Comparing dates:', { selectedDate, today }); // Debug log

  return selectedDate < today ? { futureDateValidator: true } : null;
};

@Component({
  selector: 'app-add-class-dialog',
  standalone: false,
  templateUrl: './add-class-dialog.component.html',
  styleUrl: './add-class-dialog.component.scss'
})
export class AddClassDialogComponent implements OnInit {
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
  startEndTimeCustomValidationStatus = false;

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<AddClassDialogComponent>,
    private readonly http: HttpService,
    private readonly addClassService: AddClassService,
    private readonly messageService: MessageServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.classForm = this.fb.group(
      {
        classTitle: ['', [Validators.required, Validators.maxLength(50)]],
        classType:  ['', [Validators.required]],
        description: ['', [Validators.required, Validators.maxLength(200)]],
        date: ['', [Validators.required, futureDateValidator]],
        startTime: ['', [Validators.required]],
        endTime: ['', [Validators.required]],
        conductorName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s.'-]+$/)]],
        profession: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s&-]+$/)]],
        totalSlots: ['', [Validators.required, Validators.min(1), Validators.max(25), Validators.pattern(/^\d+$/)]],
        fee: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
        status: ['', [Validators.required]]
      },
      { validators: startTimeBeforeEndTimeValidator }
    );
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

  onEdit(data: any): void {
    this.saveButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    const startTimeString = this.formatTimeArray(data.startTime);
    const endTimeString = this.formatTimeArray(data.endTime);

    this.classForm.patchValue({
      classTitle: data.classTitle,
      classType:  data.classType,
      description: data.description,
      date: moment(data.date).format('YYYY-MM-DD'),
      startTime: startTimeString,
      endTime: endTimeString,
      conductorName: data.conductorName,
      profession: data.profession,
      totalSlots: data.totalSlots,
      remainingSlots: data.remainingSlots,
      fee: data.fee,
      status: data.status
    });

    this.classForm.get('date').clearValidators();
    this.classForm.get('date').updateValueAndValidity();
    this.classForm.get('date').setValidators(Validators.required);
    this.classForm.get('date').updateValueAndValidity();
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

  onDateChange(_event: any) {
    // Native date input already provides YYYY-MM-DD — no conversion needed
  }

  formatTimeArray(arr: number[]): string {
    const [h, m] = arr;
    return `${this.pad(h)}:${this.pad(m)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0'); // ensures two digits
  }
}
