import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NewSupplierServiceService } from 'src/app/services/new-supplier/new-supplier-service.service';
import { MatDialogRef } from '@angular/material/dialog';

import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-supplier-dialog',
  standalone: false,
  templateUrl: './new-supplier-dialog.component.html',
  styleUrls: ['./new-supplier-dialog.component.scss']
})
export class NewSupplierDialogComponent {

  supplierForm: FormGroup;
  saveButtonLabel = "Save";
  mode = "add";
  selectedData;

  constructor(
    private fb: FormBuilder,
    private newSupplierService: NewSupplierServiceService,
    public dialogRef: MatDialogRef<NewSupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    
    this.supplierForm = this.fb.group({
      supplierName: new FormControl(data?.supplierName || ''),
      contactPerson: new FormControl(data?.contactPerson || ''),
      contactNo: new FormControl(data?.contactNo || ''),
      emailAddress: new FormControl(data?.emailAddress || ''),
      officeAddress: new FormControl(data?.officeAddress || ''),
      postalAddress: new FormControl(data?.postalAddress || ''),
      equipmentType: this.fb.group({
        machines: new FormControl(data?.equipmentType?.includes('Machines') || false),
        freeweights: new FormControl(data?.equipmentType?.includes('Freeweights') || false),
        other: new FormControl(data?.equipmentType?.includes('Other') || false),
        supplements: new FormControl(data?.equipmentType?.includes('Supplements') || false),
      }),
      status: new FormControl(data?.status ?? true),
      remarks: new FormControl(data?.remarks || ''),
    });
  }

  //Onsubmit function to add new supplier
  onSubmit() {
    const formValue = this.supplierForm.value;

    // Convert equipmentType group to string array
    const selectedEquipmentTypes: string[] = Object.entries(formValue.equipmentType)
      .filter(([key, value]) => value === true)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    // Build final payload
    const payload = {
      ...formValue,
      equipmentType: selectedEquipmentTypes,
    };

    if (this.mode === 'add') {
      this.newSupplierService.serviceCall(payload).subscribe(
        (response) => {
          this.dialogRef.close({ action: 'add', data: response });
        },
        (error) => console.error('Error adding supplier:', error)
      );
    } else if (this.mode === 'edit') {
      this.newSupplierService.editData(this.selectedData?.id, payload).subscribe(
        (response) => {
          this.dialogRef.close({ action: 'edit', data: response });
        },
        (error) => console.error('Error editing supplier:', error)
      );
    }
  }


  // Close button function
  closeDialog(): void {
    // Close the dialog after clicking close button
    this.dialogRef.close();
  }

  onEdit(data: any): void {
    this.supplierForm.patchValue({
      supplierName: data.supplierName,
      contactPerson: data.contactPerson,
      contactNo: data.contactNo,
      emailAddress: data.emailAddress,
      officeAddress: data.officeAddress,
      postalAddress: data.postalAddress,
      status: data.status,
      remarks: data.remarks,
      equipmentType: {
        machines: data.equipmentType?.includes('Machines') || false,
        freeweights: data.equipmentType?.includes('Freeweights') || false,
        other: data.equipmentType?.includes('Other') || false,
      }
    });
    this.saveButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;
  }
}
