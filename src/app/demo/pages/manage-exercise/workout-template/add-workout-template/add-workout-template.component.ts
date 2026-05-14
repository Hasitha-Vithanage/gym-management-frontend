import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AddExerciseComponent } from '../../add-exercise/add-exercise.component';
import { WorkoutTemplatesService } from 'src/app/services/workout-templates/workout-templates.service';

@Component({
  selector: 'app-add-workout-template',
  standalone: false,
  templateUrl: './add-workout-template.component.html',
  styleUrl: './add-workout-template.component.scss'
})
export class AddWorkoutTemplateComponent implements OnInit, OnDestroy {
  templateForm!: FormGroup;
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
    private workoutService: WorkoutTemplatesService,
    private messageService: MessageServiceService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.templateForm = this.fb.group({
      // Basic Info
      templateName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]],

      // Classification
      goal: ['', Validators.required],
      difficultyLevel: ['', Validators.required],
      intensityLevel: ['', Validators.required],
      location: ['', Validators.required],
      equipmentRequired: [[], Validators.required],

      // Schedule
      durationMinutes: ['', [Validators.required, Validators.min(15), Validators.max(180)]],
      daysPerWeek: ['', [Validators.required, Validators.min(1), Validators.max(7)]],
      programLengthWeeks: ['', [Validators.min(1), Validators.max(52)]], // optional

      // Targeting
      suitableFor: ['', Validators.required],
      recommendedBMI: [[]], // optional multi-select

      // Meta
      status: ['Draft', Validators.required], // default to Draft
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.templateForm.invalid) {
      return;
    }

    if (this.mode === 'add') {
      this.templateForm.patchValue({ status: 'Active' });

      this.workoutService.createWorkoutTemplate(this.prepareFormData()).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Workout template added successfully!');
          this.notificationService.addNotification('Workout Template Added Successfully', 'success', 1);
          this.dialogRef.close({ action: 'add', data: response });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'Something went wrong.';
          this.messageService.showError(errorMessage);
        }
      });
    } else if (this.mode === 'edit') {
      this.workoutService.updateWorkoutTemplate(this.selectedData?.id, this.prepareFormData()).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Workout template updated successfully!');
          this.dialogRef.close({ action: 'edit', data: response });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'Action failed.';
          this.messageService.showError(errorMessage);
        }
      });
    }
  }

  onEquipmentChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const current: string[] = this.templateForm.get('equipmentRequired')?.value || [];

    if (checkbox.checked) {
      this.templateForm.get('equipmentRequired')?.setValue([...current, checkbox.value]);
    } else {
      this.templateForm.get('equipmentRequired')?.setValue(
        current.filter(v => v !== checkbox.value)
      );
    }
  }

  onBMIChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const current: string[] = this.templateForm.get('recommendedBMI')?.value || [];

    if (checkbox.checked) {
      this.templateForm.get('recommendedBMI')?.setValue([...current, checkbox.value]);
    } else {
      this.templateForm.get('recommendedBMI')?.setValue(
        current.filter(v => v !== checkbox.value)
      );
    }
  }

  onEdit(data: any): void {
    this.templateForm.patchValue({

    // Basic Info
    templateName: data.templateName,
    description: data.description,

    // Classification
    goal: data.goal,
    difficultyLevel: data.difficultyLevel,
    intensityLevel: data.intensityLevel,
    location: data.location,
    equipmentRequired: data.equipmentRequired ?? [],

    // Schedule
    durationMinutes: data.durationMinutes,
    daysPerWeek: data.daysPerWeek,
    programLengthWeeks: data.programLengthWeeks,

    // Targeting
    suitableFor: data.suitableFor,
    recommendedBMI: data.recommendedBMI ?? [],

    // Meta
    status: data.status

  });

    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.valueChangesSub?.unsubscribe();
    this.valueChangesSub = this.templateForm.valueChanges.subscribe(() => {
      this.submitDisabled = this.templateForm.pristine;
    });
  }

  resetData(): void {
    this.templateForm.reset();
    this.templateForm.setErrors(null);
    this.templateForm.updateValueAndValidity();
    this.templateForm.enable();
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
    const templateFormData = new FormData();

    const { image, imageName, imageType, ...formValues } = this.templateForm.value;
    templateFormData.append('templateForm', new Blob([JSON.stringify(formValues)], { type: 'application/json' }));

    const imageValue = this.templateForm.get('image')?.value;
    const imageTypeValue = this.templateForm.get('imageType')?.value;
    const imageNameValue = this.templateForm.get('imageName')?.value;

    if (this.isFileSelected && imageValue) {
      templateFormData.append('image', imageValue, imageValue.name);
    } else if (!this.isFileSelected && imageValue && imageTypeValue && imageNameValue) {
      const imageBlob = this.base64ToBlob(imageValue, imageTypeValue);
      const file = new File([imageBlob], imageNameValue, { type: imageTypeValue });
      templateFormData.append('image', file, file.name);
    }

    return templateFormData;
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from({ length: byteCharacters.length }, (_, i) => byteCharacters.charCodeAt(i));
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.selectedImageUrl = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this.isFileSelected = true;
      this.templateForm.get('image')?.setValue(file);
    }
  }
}
