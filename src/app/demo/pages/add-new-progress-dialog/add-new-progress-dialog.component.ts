import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NewProgressServiceService } from 'src/app/services/new-progress/new-progress-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { error } from 'console';

@Component({
  selector: 'app-add-new-progress-dialog',
  standalone: false,
  templateUrl: './add-new-progress-dialog.component.html',
  styleUrl: './add-new-progress-dialog.component.scss'
})
export class AddNewProgressDialogComponent {

  progressForm: FormGroup;
  saveButtonLabel = "Save";
  submitted = false;
  mode = "add";
  selectedData;


  frontImageUrl: any;
  sideImageUrl: any;
  backImageUrl: any;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private progressService: NewProgressServiceService,
    private messageService: MessageServiceService,
    public dialogRef: MatDialogRef<AddNewProgressDialogComponent>,
    private http: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    this.progressForm = this.fb.group({
      date: new FormControl(this.data?.purchaseDate || today, [Validators.required]),
      weight: new FormControl('', Validators.required),
      height: new FormControl('', Validators.required),
      waist: new FormControl('', Validators.required),
      hip: new FormControl('', Validators.required),
      neck: new FormControl('', Validators.required),
      bmi: new FormControl({ value: '', disabled: true }),
      bodyFat: new FormControl({ value: '', disabled: true }),
      gender: new FormControl('', Validators.required),
      remarks: new FormControl(''),

      frontImage: new FormControl(''),
      frontImageName: new FormControl(''),
      frontImageType: new FormControl(''),

      sideImage: new FormControl(''),
      sideImageName: new FormControl(''),
      sideImageType: new FormControl(''),

      backImage: new FormControl(''),
      backImageName: new FormControl(''),
      backImageType: new FormControl(''),
    });

    // this.progressForm.get('date')?.disable();
  }

  ngOnInit(): void {
    this.progressForm.valueChanges.subscribe(values => {
      this.calculateBMI(values.height, values.weight);
      this.calculateBodyFat(values);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Function to calculate BMI
  calculateBMI(height: number, weight: number): void {
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      this.progressForm.get('bmi').setValue(bmi.toFixed(2), { emitEvent: false });
    }
  }

  // Function to calculate body fat percentage
  calculateBodyFat(values: any): void {
    const { gender, waist, neck, hip, height } = values;
    if (gender && waist && neck && height && (gender === 'Male' || (gender === 'Female' && hip))) {
      const logBase10 = Math.log10;
      let bodyFat = 0;
      if (gender === 'Male') {
        bodyFat = 495 / (1.0324 - 0.19077 * logBase10(waist - neck) + 0.15456 * logBase10(height)) - 450;
      } else {
        bodyFat = 495 / (1.29579 - 0.35004 * logBase10(waist + hip - neck) + 0.221 * logBase10(height)) - 450;
      }
      this.progressForm.get('bodyFat').setValue(bodyFat.toFixed(2), { emitEvent: false });
    }
  }

  // OnSubmit function to save new or update existing progress
  onSubmit(): void {
    this.submitted = true;
    const userName = this.http.getLoginNameFromCache();
    if (this.progressForm.invalid) return;

    this.progressService.serviceCall(this.prepareFormData(), userName).subscribe({
      next: (response) => {
        this.messageService.showSuccess("Progress data saved successfully!")
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }


  // Edit function to populate form with existing data
  onEdit(data: any): void {
    this.progressForm.patchValue({
      category: data.category,
      supplier: data.supplier,
      brandName: data.brandName,
      quantity: data.quantity,
      condition: data.condition,
      purchaseDate: data.purchaseDate,
      addedBy: data.addedBy,
      machineName: data.machineName,
      muscleGroups: data.muscleGroups,
      model: data.model,
      type: data.type,
      sizeStandard: data.sizeStandard,
      barLength: data.barLength,
      weight: data.weight,
      equipmentName: data.equipmentName,
      remarks: data.remarks
    });
    this.saveButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;

  }

  prepareFormData(): FormData {
    const formData = new FormData();
    formData.append('progressForm', new Blob([JSON.stringify(this.progressForm.getRawValue())], { type: 'application/json' }));

    ['front', 'side', 'back'].forEach(view => {
      const file = this.progressForm.get(`${view}Image`)?.value;
      if (file) {
        formData.append(`${view}Image`, file, file.name);
      }
    });

    return formData;
  }

  onFileSelected(event: any, view: 'front' | 'side' | 'back'): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this[`${view}ImageUrl`] = url;

      this.progressForm.get(`${view}Image`).setValue(file);
      this.progressForm.get(`${view}ImageName`).setValue(file.name);
      this.progressForm.get(`${view}ImageType`).setValue(file.type);
    }
  }

}
