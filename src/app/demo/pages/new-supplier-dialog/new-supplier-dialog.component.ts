import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { NewSupplierServiceService } from 'src/app/services/new-supplier/new-supplier-service.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

/** Requires at least one checkbox in the equipmentType group to be checked. */
function atLeastOneSupplyTypeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const values = Object.values(group.value ?? {});
    return values.some((v) => v === true) ? null : { atLeastOneRequired: true };
  };
}

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
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private newSupplierService: NewSupplierServiceService,
    private messageService: MessageServiceService,
    public dialogRef: MatDialogRef<NewSupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.supplierForm = this.fb.group({
      supplierName: new FormControl(data?.supplierName || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      contactPerson: new FormControl(data?.contactPerson || '', [Validators.required, Validators.maxLength(50)]),
      contactNo: new FormControl(data?.contactNo || '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      emailAddress: new FormControl(data?.emailAddress || '', [Validators.required, Validators.email, Validators.maxLength(50)]),
      officeAddress: new FormControl(data?.officeAddress || '', [Validators.required, Validators.maxLength(100)]),
      postalAddress: new FormControl(data?.postalAddress || '', [Validators.maxLength(100)]),
      equipmentType: this.fb.group({
        machines: new FormControl(data?.equipmentType?.includes('Machines') || false),
        freeweights: new FormControl(data?.equipmentType?.includes('Freeweights') || false),
        other: new FormControl(data?.equipmentType?.includes('Other') || false),
      }, { validators: atLeastOneSupplyTypeValidator() }),
      status: new FormControl(data?.status ?? true, [Validators.required]),
      remarks: new FormControl(data?.remarks || '', [Validators.maxLength(1000)]),
    });
  }

  //Onsubmit function to add new supplier
  onSubmit() {
    this.submitted = true;

    if (this.supplierForm.invalid) {
      const invalidFields = this.getInvalidFieldSummary();
      const message = invalidFields.length
        ? `Please check: ${invalidFields.join(', ')}`
        : 'Please correct the errors in the form before submitting.';
      this.messageService.showError(message);
      return;
    }

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
      this.newSupplierService.serviceCall(payload).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Supplier added successfully!');
          this.dialogRef.close({ action: 'add', data: response });
        },
        error: (error) => this.messageService.showError(error)
      });
    } else if (this.mode === 'edit') {
      this.newSupplierService.editData(this.selectedData?.id, payload).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Supplier updated successfully!');
          this.dialogRef.close({ action: 'edit', data: response });
        },
        error: (error) => this.messageService.showError(error)
      });
    }
  }

  /** Returns human-readable labels for every top-level control that is currently invalid. */
  private getInvalidFieldSummary(): string[] {
    const labels: { [key: string]: string } = {
      supplierName: 'Supplier Name',
      contactPerson: 'Contact Person',
      contactNo: 'Contact No',
      emailAddress: 'Email Address',
      officeAddress: 'Office Address',
      postalAddress: 'Postal Address',
      status: 'Status',
      remarks: 'Remarks',
      equipmentType: 'Supply Type'
    };

    const invalid: string[] = [];
    Object.keys(this.supplierForm.controls).forEach((key) => {
      const control = this.supplierForm.get(key);
      if (control?.invalid) {
        invalid.push(labels[key] || key);
      }
    });
    return invalid;
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
