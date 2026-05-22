import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { NewEquipmentServiceService } from 'src/app/services/new-equipment/new-equipment-service.service';
import moment from 'moment';

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
  supplierList: any[] = [];  // List of suppliers
  userName;

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
    private http: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const userName = this.http.getLoginNameFromCache();

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
      addedBy: new FormControl(this.data?.addedBy || userName, [Validators.required]),
      remarks: new FormControl(this.data?.remarks || '')
    });

    // Function for get suppliers
    this.getSuppliers();

    // Setting current user's username as addedBy
    this.userName = this.http.getLoginNameFromCache();

    // Disable the addedBy filed
    this.equipmentForm.get('addedBy')?.disable();
    this.equipmentForm.get('purchaseDate')?.disable();
  }

  // getSupplier function
  public getSuppliers(): void {
    //Call Service to get suppliers
    this.newEquipmentService.getSuppliers().subscribe({
      next: (response: any[]) => {
        console.log("Suppliers: ", response);
        this.supplierList = response;
      },
      error: (error) => {
        console.log('Error fetching suppliers:', error);
      }
    });
  }

  // OnSubmit function to save new or update existing equipment
  onSubmit() {
    const formValue = this.equipmentForm.getRawValue();

    // Convert equipmentType group to string array
    // const selectedMuscleGroups: string[] = Object.entries(formValue.muscleGroups)
    //   .filter(([key, value]) => value === true)
    //   .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    // // Build final payload
    // const payload = {
    //   ...formValue,
    //   muscleGroups: selectedMuscleGroups,
    // };

    // Calling service to add or edit equipment
    if (this.mode === 'add') {
      this.newEquipmentService.serviceCall(formValue).subscribe(
        (response) => {
          this.dialogRef.close({ action: 'add', data: response });
        },
        (error) => console.error('Error adding equipment:', error)
      );
    } else if (this.mode === 'edit') {
      formValue.id = this.selectedData?.id;
      this.newEquipmentService.editData(this.selectedData?.id, formValue).subscribe(
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

    this.saveButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;

    this.equipmentForm.patchValue({
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


    // patching date for native date input (requires YYYY-MM-DD string)
    this.equipmentForm.patchValue({
      purchaseDate: moment(data.purchaseDate).format('YYYY-MM-DD'),
    });
  }
}
