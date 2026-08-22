import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AddExerciseService } from 'src/app/services/add-exercise/add-exercise.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-add-exercise',
  standalone: false,
  templateUrl: './add-exercise.component.html',
  styleUrl: './add-exercise.component.scss'
})
export class AddExerciseComponent implements OnInit, OnDestroy {

  exerciseForm!: FormGroup;
  registerButtonLabel: string = 'Save';
  mode: string = 'add';
  selectedData: any;
  isDisabled: boolean = false;
  submitted: boolean = false;
  submitDisabled: boolean = true;
  selectedImageUrl: any;
  isFileSelected: boolean = false;

  private valueChangesSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddExerciseComponent>,
    private exerciseService: AddExerciseService,
    private messageService: MessageServiceService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.exerciseForm = this.fb.group({
      exerciseName:         ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description:          ['', [Validators.maxLength(500)]],
      instructions:         ['', [Validators.maxLength(2000)]],
      muscleGroup:          ['', [Validators.required]],
      muscleGroupSecondary: [''],
      exerciseType:         ['', [Validators.required]],
      movementType:         ['', [Validators.required]],
      difficultyLevel:      ['', [Validators.required]],
      intensityLevel:       ['', [Validators.required]],
      equipmentType:        ['', [Validators.required]],
      location:             ['', [Validators.required]],
      goalType:             ['', [Validators.required]],
      suitableFor:          ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.exerciseForm.invalid) {
      return;
    }

    if (this.mode === 'add') {
      this.exerciseForm.patchValue({ status: 'Active' });

      this.exerciseService.createExercise(this.prepareFormData()).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Exercise added successfully!');
          this.notificationService.addNotification(`Exercise "${response.exerciseName}" Added Successfully`, 'success', 1);
          this.dialogRef.close({ action: 'add', data: response });
        },
        error: (error) => {
          this.messageService.showError(error);
        }
      });

    } else if (this.mode === 'edit') {

      this.exerciseService.updateExercise(this.selectedData?.id, this.prepareFormData()).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Exercise updated successfully!');
          this.notificationService.addNotification(`Exercise "${response.exerciseName}" Updated Successfully`, 'success', 1);
          this.dialogRef.close({ action: 'edit', data: response });
        },
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    }
  }

  onEdit(data: any): void {
    this.exerciseForm.patchValue({
      exerciseName:         data.exerciseName,
      description:          data.description,
      instructions:         data.instructions,
      muscleGroup:          data.muscleGroup,
      muscleGroupSecondary: data.muscleGroupSecondary,
      exerciseType:         data.exerciseType,
      movementType:         data.movementType,
      difficultyLevel:      data.difficultyLevel,
      intensityLevel:       data.intensityLevel,
      equipmentType:        data.equipmentType,
      location:             data.location,
      goalType:             data.goalType,
      suitableFor:          data.suitableFor,
      image:                data.image     ?? null,
      imageName:            data.imageName ?? '',
      imageType:            data.imageType ?? '',
    });

    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.valueChangesSub?.unsubscribe();
    this.valueChangesSub = this.exerciseForm.valueChanges.subscribe(() => {
      this.submitDisabled = this.exerciseForm.pristine;
    });
  }

  resetData(): void {
    this.exerciseForm.reset();
    this.exerciseForm.setErrors(null);
    this.exerciseForm.updateValueAndValidity();
    this.exerciseForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.isFileSelected = false;
    this.selectedImageUrl = null;
    this.registerButtonLabel = 'Save';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  public prepareFormData(): FormData {
    const exerciseFormData = new FormData();

    const { image, imageName, imageType, ...formValues } = this.exerciseForm.value;
    exerciseFormData.append(
      'exerciseForm',
      new Blob([JSON.stringify(formValues)], { type: 'application/json' })
    );

    const imageValue = this.exerciseForm.get('image')?.value;
    const imageTypeValue = this.exerciseForm.get('imageType')?.value;
    const imageNameValue = this.exerciseForm.get('imageName')?.value;

    if (this.isFileSelected && imageValue) {
      exerciseFormData.append('image', imageValue, imageValue.name);
    } else if (!this.isFileSelected && imageValue && imageTypeValue && imageNameValue) {
      const imageBlob = this.base64ToBlob(imageValue, imageTypeValue);
      const file = new File([imageBlob], imageNameValue, { type: imageTypeValue });
      exerciseFormData.append('image', file, file.name);
    }

    return exerciseFormData;
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from({ length: byteCharacters.length },
      (_, i) => byteCharacters.charCodeAt(i)
    );
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.selectedImageUrl = this.sanitizer.bypassSecurityTrustUrl(
        window.URL.createObjectURL(file)
      );
      this.isFileSelected = true;
      this.exerciseForm.get('image')?.setValue(file);
    }
  }
}