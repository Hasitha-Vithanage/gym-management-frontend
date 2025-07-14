import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { WorkoutPlanUploadService } from 'src/app/services/workout-plan-upload/workout-plan-upload.service';

@Component({
  selector: 'app-upload-workout-plan-dialog',
  standalone: false,
  templateUrl: './upload-workout-plan-dialog.component.html',
  styleUrl: './upload-workout-plan-dialog.component.scss'
})
export class UploadWorkoutPlanDialogComponent {

  workoutUploadForm: FormGroup;
  registerButtonLabel = 'Register';
  selectedFile: File | null = null;
  isDisabled = false;
  submitted = false;
  mode = 'add';
  selectedData;
  dataSource: MatTableDataSource<any>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UploadWorkoutPlanDialogComponent>,
    private http: HttpService,
    private uploadWorkoutService: WorkoutPlanUploadService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.workoutUploadForm = new FormGroup({
      workoutPlanTitle: new FormControl('', [Validators.required, Validators.minLength(5)]),
      planDescription: new FormControl('', []),
      userId: new FormControl('', []),
    });

  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.submitted = true;



    if (this.workoutUploadForm.invalid || !this.selectedFile) {
      this.messageService.showError("Please complete the form and select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append('workoutPlanTitle', this.workoutUploadForm.get('workoutPlanTitle').value);
    formData.append('planDescription', this.workoutUploadForm.get('planDescription').value);
    formData.append('pdf', this.selectedFile);
    formData.append('userId', this.workoutUploadForm.get('userId').value);


    this.uploadWorkoutService.serviceCall(formData).subscribe({
      next: (response) => {
        this.messageService.showSuccess("Workout plan uploaded successfully!");
        this.dataSource = new MatTableDataSource([response, ...(this.dataSource?.data || [])]);
        this.closeDialog();
      },
      error: (err) => {
        this.messageService.showError("Upload failed: " + err.error?.message || err.message);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.messageService.showError('Only PDF files are allowed.');
        return;
      }
      this.selectedFile = file;
    }
  }

  resetData(): void {
    this.workoutUploadForm.reset();
    this.selectedFile = null;
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Register';
  }

  addNotification(details: any): void {
    this.notificationService.addNotification('Workout Plan Uploaded', 'success', 1);
  }


  onEdit(data: any): void {
    this.workoutUploadForm.patchValue({
      workoutPlanTitle: data.employeeId,
      planDescription: data.jobTitle,
      workoutPdf: data.dateOfJoining,
      userId: data.userId
    });
    this.registerButtonLabel = "Upload";
    this.mode = "edit";
    this.selectedData = data;
  }

}
