import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewEquipmentServiceService } from 'src/app/services/new-equipment/new-equipment-service.service';

@Component({
  selector: 'app-new-equipment-dialog',
  standalone: false,
  templateUrl: './new-equipment-dialog.component.html',
  styleUrls: ['./new-equipment-dialog.component.scss']
})
export class NewEquipmentDialogComponent {
  equipmentForm: FormGroup;
  saveButtonLabel = "Save";
  mode = "add";
  selectedData: any;
  suppliers: any[] = [];  // List of suppliers

  // Muscle group options for the dropdown
  muscleGroupsList: string[] = [
    'Upper Body',
    'Core',
    'Lower Body',
    'Full Body',
    'Cardio / Conditioning',
    'Stabilizer Muscles'
  ];

  constructor(
    private fb: FormBuilder,
    private newEquipmentService: NewEquipmentServiceService,
    public dialogRef: MatDialogRef<NewEquipmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {

     // Get today's date
     const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

     this.equipmentForm = this.fb.group({
       category: new FormControl(this.data?.category || '', [Validators.required]),
       supplier: new FormControl(this.data?.supplier || '', [Validators.required]),
       machineName: new FormControl(this.data?.machineName || ''),
       muscleGroups: new FormControl(this.data?.muscleGroups || []),
       brandName: new FormControl(this.data?.brandName || ''),
       model: new FormControl(this.data?.model || ''),
       type: new FormControl(this.data?.type || ''),
       sizeStandard: new FormControl(this.data?.sizeStandard || ''),
       barLength: new FormControl(this.data?.barLength || ''),
       weight: new FormControl(this.data?.weight || ''),
       equipmentName: new FormControl(this.data?.equipmentName || ''),
       quantity: new FormControl(this.data?.quantity || '', [Validators.required]),
       condition: new FormControl(this.data?.condition || ''),
       purchaseDate: new FormControl(this.data?.purchaseDate || today, [Validators.required]), // Set today's date
       addedBy: new FormControl(this.data?.addedBy || '', [Validators.required]),
       remarks: new FormControl(this.data?.remarks || '')
     });
  }

  // OnSubmit function to save new or update existing equipment
  onSubmit() {
    const formValue = this.equipmentForm.value;

    // Convert equipmentType group to string array
    const selectedEquipmentTypes: string[] = Object.entries(formValue.equipmentType)
      .filter(([key, value]) => value === true)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    // Build final payload
    const payload = {
      ...formValue,
      equipmentType: selectedEquipmentTypes,
    };

    // Calling service to add or edit equipment
    if (this.mode === 'add') {
      this.newEquipmentService.serviceCall(payload).subscribe(
        (response) => {
          this.dialogRef.close({ action: 'add', data: response });
        },
        (error) => console.error('Error adding equipment:', error)
      );
    } else if (this.mode === 'edit') {
      this.newEquipmentService.editData(this.selectedData?.id, payload).subscribe(
        (response) => {
          this.dialogRef.close({ action: 'edit', data: response });
        },
        (error) => console.error('Error editing equipment:', error)
      );
    }
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }

  // Edit function to populate form with existing data
  onEdit(data: any): void {
    this.equipmentForm.patchValue({
      supplier: data.supplier,
      machineName: data.machineName,
      muscleGroups: data.muscleGroups,
      brandName: data.brandName,
      model: data.model,
      type: data.type,
      sizeStandard: data.sizeStandard,
      barLength: data.barLength,
      weight: data.weight,
      equipmentName: data.equipmentName,
      quantity: data.quantity,
      condition: data.condition,
      purchaseDate: data.purchaseDate,
      addedBy: data.addedBy,
      remarks: data.remarks
    });
    this.saveButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;
  }
}
