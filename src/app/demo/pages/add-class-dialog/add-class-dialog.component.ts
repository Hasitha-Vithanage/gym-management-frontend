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
    return new Date(0, 0, 0, time[0], time[1]);
  }
  if (typeof time === 'string') {
    const [hour, minute] = time.split(':').map(Number);
    return new Date(0, 0, 0, hour, minute);
  }
  return new Date(time);
}

export const futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const inputDate = control.value;

  if (!inputDate) return null;

  let selectedDate: Date;
  if (typeof inputDate === 'string') {
    selectedDate = new Date(inputDate);
  } else if (inputDate instanceof Date) {
    selectedDate = inputDate;
  } else {
    return { invalidDate: true };
  }

  if (Number.isNaN(selectedDate.getTime())) {
    return { invalidDate: true };
  }

  selectedDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  trainers: any[] = [];

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
        classTitle:        ['', [Validators.required, Validators.maxLength(50)]],
        classType:         ['', [Validators.required]],
        description:       ['', [Validators.required, Validators.maxLength(200)]],
        date:              ['', [Validators.required, futureDateValidator]],
        startTime:         ['', [Validators.required]],
        endTime:           ['', [Validators.required]],
        trainerEmployeeId: ['', [Validators.required]],
        totalSlots:        ['', [Validators.required, Validators.min(1), Validators.max(25), Validators.pattern(/^\d+$/)]],
        status:            ['', [Validators.required]]
      },
      { validators: startTimeBeforeEndTimeValidator }
    );
    this.loadTrainers();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.classForm.invalid) return;

    const newTotal = this.classForm.value.totalSlots;
    const remainingSlots = this.mode === 'edit'
      ? this.selectedData.remainingSlots + (newTotal - this.selectedData.totalSlots)
      : newTotal;

    const selectedTrainerId = +this.classForm.value.trainerEmployeeId;
    const selectedTrainer = this.trainers.find(t => t.id === selectedTrainerId);

    if (!selectedTrainer) {
      this.messageService.showError('Selected trainer could not be found. Please reload the form and try again.');
      this.isDisabled = false;
      return;
    }

    const conductorName = `${selectedTrainer.firstName} ${selectedTrainer.lastName}`.trim();

    const payload = {
      ...this.classForm.value,
      conductorName,
      remainingSlots: Math.max(0, remainingSlots),
      ...(this.mode === 'edit' ? { id: this.selectedData.id } : {})
    };

    this.isDisabled = true;

    if (this.mode === 'add') {
      this.addClassService.serviceCall(payload).subscribe({
        next: (response: any) => {
          this.messageService.showSuccess('Class scheduled successfully!');
          this.dialogRef.close({ action: 'add', data: response });
        },
        error: (err) => {
          this.messageService.showError(err ?? 'Failed to schedule the class. Please try again.');
          this.isDisabled = false;
        }
      });
    } else if (this.mode === 'edit') {
      this.addClassService.editData(payload.id, payload).subscribe({
        next: (response: any) => {
          this.messageService.showSuccess('Class details updated successfully!');
          this.dialogRef.close({ action: 'edit', data: response });
        },
        error: (err) => {
          this.messageService.showError(err ?? 'Failed to update the class. Please try again.');
          this.isDisabled = false;
        }
      });
    }
  }

  onEdit(data: any): void {
    this.saveButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    const startTimeString = this.formatTimeArray(data.startTime);
    const endTimeString = this.formatTimeArray(data.endTime);

    this.classForm.patchValue({
      classTitle:        data.classTitle,
      classType:         data.classType,
      description:       data.description,
      date:              moment(data.date).format('YYYY-MM-DD'),
      startTime:         startTimeString,
      endTime:           endTimeString,
      trainerEmployeeId: data.trainerEmployeeId?.toString() ?? '',
      totalSlots:        data.totalSlots,
      status:            data.status
    });

    this.classForm.get('date').setValidators([Validators.required, futureDateValidator]);
    this.classForm.get('date').updateValueAndValidity();
  }

  loadTrainers(): void {
    this.addClassService.getTrainers().subscribe({
      next: (data: any[]) => { this.trainers = data ?? []; },
      error: () => this.messageService.showError('Failed to load trainers. Please try again.')
    });
  }

  public resetData(): void {
    this.classForm.reset();
    this.classForm.setErrors(null);
    this.classForm.updateValueAndValidity();
    this.classForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.saveButtonLabel = 'Schedule';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onDateChange(_event: any): void {
    // Native date input provides YYYY-MM-DD directly — no conversion needed.
  }

  formatTimeArray(arr: number[]): string {
    const [h, m] = arr;
    return `${this.pad(h)}:${this.pad(m)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
