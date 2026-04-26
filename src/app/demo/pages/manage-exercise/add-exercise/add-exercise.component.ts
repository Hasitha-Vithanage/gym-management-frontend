import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NewEmployeeDialogComponent } from '../../new-employee-dialog/new-employee-dialog.component';

@Component({
  selector: 'app-add-exercise',
  standalone: false,
  templateUrl: './add-exercise.component.html',
  styleUrl: './add-exercise.component.scss'
})
export class AddExerciseComponent {
  exerciseForm: FormGroup;
  registerButtonLabel: string = 'Register';
  mode: string = 'add';
  selectedData: any;
  isDisabled: boolean = false;
  submitted: boolean = false;
  userName: string = '';
  dataSource: MatTableDataSource<any>;
  today: Date = new Date();
  submitDisabled: boolean = true;
  selectedImageUrl: any;
  isFileSelected: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewEmployeeDialogComponent>,
    private employeeService: EmpolyeeServiceService,
    private messageService: MessageServiceService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.exerciseForm = this.fb.group({
      exerciseName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      instructions: ['', [Validators.maxLength(2000)]],
      muscleGroup: ['', [Validators.required]],
      muscleGroupSecondary: [''],
      exerciseType: ['', [Validators.required]],
      movementType: ['', [Validators.required]],
      difficultyLevel: ['', [Validators.required]],
      intensityLevel: ['', Validators.required],
      equipmentType: ['', [Validators.required]],
      location: ['', [Validators.required]],
      goalType: ['', [Validators.required]],
      suitableFor: ['', [Validators.required]],
      image: new FormControl(''),
      imageName: new FormControl(''),
      imageType: new FormControl('')
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.exerciseForm.invalid) {
      return;
    }

    if (this.mode === 'add') {
      this.exerciseForm.patchValue({ status: 'Active' });

      try {
        this.employeeService.serviceCall(this.prepareFormData()).subscribe({
          next: (response) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }

            this.messageService.showSuccess('Employee added successfully!');
          },
          error: (error) => {
            const errorMessage = error?.error?.message || error?.error || 'Something went wrong.';
            this.messageService.showError(errorMessage);
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    } else if (this.mode === 'edit') {
      try {
        this.employeeService.editData(this.selectedData?.id, this.prepareFormData()).subscribe({
          next: (response) => {
            this.messageService.showSuccess('Employee edited successfully!');

            const index = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[index] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);
          },
          error: (error) => {
            this.messageService.showError('Action failed with error: ' + error);
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    }

    this.closeDialog();
  }

  onEdit(data: any): void {
    this.exerciseForm.patchValue({
      exerciseName: data.exerciseName,
      description: data.description,
      instructions: data.instructions,
      muscleGroup: data.muscleGroup,
      muscleGroupSecondary: data.muscleGroupSecondary,
      exerciseType: data.exerciseType,
      movementType: data.movementType,
      difficultyLevel: data.difficultyLevel,
      intensityLevel: data.intensityLevel,
      equipmentType: data.equipmentType,
      location: data.location,
      goalType: data.goalType,
      suitableFor: data.suitableFor,
      image: data.image,
      imageName: data.imageName,
      imageType: data.imageType
    });
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;

    this.submitDisabled = true;

    this.exerciseForm.valueChanges.subscribe(() => {
      this.submitDisabled = /* !this.exerciseForm.valid || */ this.exerciseForm.pristine;
    });
  }

  public resetData(): void {
    this.exerciseForm.reset();
    this.exerciseForm.setErrors = null;
    this.exerciseForm.updateValueAndValidity();
    this.exerciseForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Register';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  public addNotification(details: any): void {
    this.notificationService.addNotification('Exercise Added Successfully', 'success', 1);
  }

  public prepareFormData(): FormData {
    const exerciseFormData = new FormData();
    exerciseFormData.append('exerciseForm', new Blob([JSON.stringify(this.exerciseForm.value)], { type: 'application/json' }));

    if (this.isFileSelected) {
      exerciseFormData.append('image', this.exerciseForm.get('image').value, this.exerciseForm.get('image').value.name);
    } else {
      const imageBlob = this.base64ToBlob(this.exerciseForm.get('image').value, this.exerciseForm.get('imageType').value);
      const file = new File([imageBlob], this.exerciseForm.get('imageName').value, { type: this.exerciseForm.get('imageType').value });
      exerciseFormData.append('image', file, file.name);
    }

    return exerciseFormData;
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  public onFileSelected(event): void {
    if (event.target.files) {
      const file = event.target.files[0];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this.selectedImageUrl = url;
      this.isFileSelected = true;
      this.exerciseForm.get('image').setValue(file);
    }
  }
}
