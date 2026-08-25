import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { NewProgressServiceService } from 'src/app/services/new-progress/new-progress-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

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

  constructor(
    private fb: FormBuilder,
    private progressService: NewProgressServiceService,
    private messageService: MessageServiceService,
    public dialogRef: MatDialogRef<AddNewProgressDialogComponent>,
    private http: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    this.progressForm = this.fb.group({
      date: new FormControl(this.data?.purchaseDate || today, [Validators.required]),
      weight:  new FormControl(this.data?.weight  ?? '', [Validators.required, Validators.min(1), Validators.max(500)]),
      height:  new FormControl(this.data?.height  ?? '', [Validators.required, Validators.min(1), Validators.max(300)]),
      bmi:     new FormControl(this.data?.bmi     ?? ''),
      bodyFat: new FormControl(''),
      gender:  new FormControl(this.data?.gender  ?? '', [Validators.required]),
      remarks: new FormControl(''),
    });

    // this.progressForm.get('date')?.disable();
  }

  ngOnInit(): void {
    this.progressForm.valueChanges.subscribe(values => {
      this.calculateBMI(values.height, values.weight);
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

  // OnSubmit function to save new or update existing progress
  onSubmit(): void {
    this.submitted = true;
    const userName = this.http.getLoginNameFromCache();
    if (this.progressForm.invalid) return;

    this.progressService.serviceCall(this.progressForm.value, userName).subscribe({
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

}
