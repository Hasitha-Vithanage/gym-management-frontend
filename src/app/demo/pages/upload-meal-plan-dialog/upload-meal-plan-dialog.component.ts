import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { MealPlanUploadService } from 'src/app/services/meal-plan-upload/meal-plan-upload.service';

@Component({
  selector: 'app-upload-meal-plan-dialog',
  standalone: false,
  templateUrl: './upload-meal-plan-dialog.component.html',
  styleUrl: './upload-meal-plan-dialog.component.scss'
})
export class UploadMealPlanDialogComponent {

  mealUploadForm: FormGroup;
    registerButtonLabel = 'Register';
    selectedFile: File | null = null;
    isDisabled = false;
    submitted = false;
    mode = 'add';
    selectedData;
    dataSource: MatTableDataSource<any>;
  
    constructor(
      private fb: FormBuilder,
      public dialogRef: MatDialogRef<UploadMealPlanDialogComponent>,
      private http: HttpService,
      private uploadMealService: MealPlanUploadService,
      private messageService: MessageServiceService,
      private notificationService: NotificationService,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) { }
  
    ngOnInit(): void {
      this.mealUploadForm = new FormGroup({
        mealPlanTitle: new FormControl('', [Validators.required, Validators.minLength(5)]),
        planDescription: new FormControl('', []),
        userId: new FormControl('', []),
      });
  
    }
  
    closeDialog(): void {
      this.dialogRef.close();
    }
  
    onSubmit(): void {
      this.submitted = true;
      console.log("Sbmit data: ", this.mealUploadForm.value);
      
  
      if (this.mealUploadForm.invalid || !this.selectedFile) {
        this.messageService.showError("Please complete the form and select a PDF file.");
        return;
      }
  
      const formData = new FormData();
      formData.append('mealPlanTitle', this.mealUploadForm.get('mealPlanTitle').value);
      formData.append('planDescription', this.mealUploadForm.get('planDescription').value);
      formData.append('pdf', this.selectedFile);
      formData.append('userId', this.mealUploadForm.get('userId').value);
  
  
      this.uploadMealService.serviceCall(formData).subscribe({
        next: (response) => {
          this.messageService.showSuccess("Meal plan uploaded successfully!");
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
      this.mealUploadForm.reset();
      this.selectedFile = null;
      this.isDisabled = false;
      this.submitted = false;
      this.registerButtonLabel = 'Register';
    }
  
    addNotification(details: any): void {
      this.notificationService.addNotification('Meal Plan Uploaded', 'success', 1);
    }
  
  
    onEdit(data: any): void {
      this.mealUploadForm.patchValue({
        // mealPlanTitle: data.employeeId,
        // planDescription: data.jobTitle,
        // mealPlanPdf: data.dateOfJoining,
        userId: data.username
      });
      this.registerButtonLabel = "Upload";
      this.mode = "edit";
      this.selectedData = data;
    }
  
}
