import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { NewEquipmentServiceService } from 'src/app/services/new-equipment/new-equipment-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
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
  supplierList: any[] = [];  // Full list of suppliers
  filteredSupplierList: any[] = [];  // Suppliers filtered by the selected category
  userName;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private newEquipmentService: NewEquipmentServiceService,
    private messageService: MessageServiceService,
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
      machineName: new FormControl(this.data?.machineName || '', [Validators.maxLength(20)]),
      brandName: new FormControl(this.data?.brandName || '', [Validators.maxLength(20)]),
      model: new FormControl(this.data?.model || '', [Validators.maxLength(50)]),
      type: new FormControl(this.data?.type || ''),
      sizeStandard: new FormControl(this.data?.sizeStandard || ''),
      barLength: new FormControl(this.data?.barLength || ''),
      weight: new FormControl(this.data?.weight || ''),
      equipmentName: new FormControl(this.data?.equipmentName || '', [Validators.maxLength(20)]),
      quantity: new FormControl(this.data?.quantity || '', [Validators.required, Validators.min(1)]),
      condition: new FormControl(this.data?.condition || '',  [Validators.required]),
      purchaseDate: new FormControl(this.data?.purchaseDate || today, [Validators.required]), // Set today's date
      addedBy: new FormControl(this.data?.addedBy || userName, [Validators.required]),
      remarks: new FormControl(this.data?.remarks || '', [Validators.maxLength(1000)])
    });

    // Function for get suppliers
    this.getSuppliers();

    // Setting current user's username as addedBy
    this.userName = this.http.getLoginNameFromCache();

    // Disable the addedBy filed
    this.equipmentForm.get('addedBy')?.disable();
    this.equipmentForm.get('purchaseDate')?.disable();

    // Apply the correct conditional requirements for the form's initial state
    this.updateConditionalValidators(this.equipmentForm.get('category')?.value, this.equipmentForm.get('type')?.value);

    // Re-filter the supplier dropdown whenever the category changes, and drop
    // a previously-selected supplier if they don't supply the new category.
    this.equipmentForm.get('category')?.valueChanges.subscribe((category: string) => {
      this.updateFilteredSuppliers(category);
      const currentSupplierId = this.equipmentForm.get('supplier')?.value;
      const stillValid = this.filteredSupplierList.some((s) => s.id === currentSupplierId);
      if (!stillValid) {
        this.equipmentForm.get('supplier')?.setValue('');
      }
      this.updateConditionalValidators(category, this.equipmentForm.get('type')?.value);
    });

    // Re-apply requirements for type-dependent fields (size standard, bar length, weight)
    this.equipmentForm.get('type')?.valueChanges.subscribe((type: string) => {
      this.updateConditionalValidators(this.equipmentForm.get('category')?.value, type);
    });
  }

  /**
   * Machine Name, Type, and Equipment Name are only relevant (and required) for their
   * matching category; Size Standard/Bar Length/Weight are only relevant for specific
   * Freeweights types. Toggling category/type re-applies the correct requirement so a
   * field that's hidden from view is never silently required or silently ignored.
   */
  private updateConditionalValidators(category: string, type: string): void {
    const machineName = this.equipmentForm.get('machineName');
    const typeControl = this.equipmentForm.get('type');
    const equipmentName = this.equipmentForm.get('equipmentName');
    const sizeStandard = this.equipmentForm.get('sizeStandard');
    const barLength = this.equipmentForm.get('barLength');
    const weight = this.equipmentForm.get('weight');

    machineName?.setValidators(category === 'Machines' ? [Validators.required, Validators.maxLength(20)] : [Validators.maxLength(20)]);
    typeControl?.setValidators(category === 'Freeweights' ? [Validators.required] : []);
    equipmentName?.setValidators(category === 'Other' ? [Validators.required, Validators.maxLength(20)] : [Validators.maxLength(20)]);
    sizeStandard?.setValidators(type === 'Bars' ? [Validators.required] : []);
    barLength?.setValidators(type === 'Bars' ? [Validators.required] : []);
    weight?.setValidators(['Dumbbells', 'Plates', 'Kettlebells'].includes(type) ? [Validators.required, Validators.min(0.1)] : []);

    [machineName, typeControl, equipmentName, sizeStandard, barLength, weight].forEach((control) =>
      control?.updateValueAndValidity({ emitEvent: false })
    );
  }

  // getSupplier function
  public getSuppliers(): void {
    //Call Service to get suppliers
    this.newEquipmentService.getSuppliers().subscribe({
      next: (response: any[]) => {
        const activeSuppliers = response.filter((supplier: any) => !supplier.deleted && supplier.status);
        this.supplierList = activeSuppliers;
        this.updateFilteredSuppliers(this.equipmentForm.get('category')?.value);
      },
      error: (error) => {
        console.log('Error fetching suppliers:', error);
      }
    });
  }

  // Filters supplierList down to suppliers that are tagged for the given equipment category
  private updateFilteredSuppliers(category: string): void {
    if (!category) {
      this.filteredSupplierList = this.supplierList;
      return;
    }
    this.filteredSupplierList = this.supplierList.filter((supplier: any) =>
      supplier.equipmentType?.includes(category)
    );
  }

  // OnSubmit function to save new or update existing equipment
  onSubmit() {
    this.submitted = true;

    if (this.equipmentForm.invalid) {
      const invalidFields = this.getInvalidFieldSummary();
      const message = invalidFields.length
        ? `Please check: ${invalidFields.join(', ')}`
        : 'Please correct the errors in the form before submitting.';
      this.messageService.showError(message);
      return;
    }

    const formValue = this.equipmentForm.getRawValue();

    // Calling service to add or edit equipment
    if (this.mode === 'add') {
      this.newEquipmentService.serviceCall(formValue).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Equipment added successfully!');
          this.dialogRef.close({ action: 'add', data: response });
        },
        error: (error) => this.messageService.showError(error)
      });
    } else if (this.mode === 'edit') {
      formValue.id = this.selectedData?.id;
      this.newEquipmentService.editData(this.selectedData?.id, formValue).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Equipment updated successfully!');
          this.dialogRef.close({ action: 'edit', data: response });
        },
        error: (error) => this.messageService.showError(error)
      });
    }
  }

  /** Returns human-readable labels for every top-level control that is currently invalid. */
  private getInvalidFieldSummary(): string[] {
    const labels: { [key: string]: string } = {
      category: 'Category',
      supplier: 'Supplier',
      machineName: 'Machine Name',
      brandName: 'Brand Name',
      model: 'Model',
      type: 'Type',
      sizeStandard: 'Size Standard',
      barLength: 'Bar Length',
      weight: 'Weight',
      equipmentName: 'Equipment Name',
      quantity: 'Quantity',
      remarks: 'Remarks'
    };

    const invalid: string[] = [];
    Object.keys(this.equipmentForm.controls).forEach((key) => {
      const control = this.equipmentForm.get(key);
      if (control?.invalid) {
        invalid.push(labels[key] || key);
      }
    });
    return invalid;
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
      model: data.model,
      type: data.type,
      sizeStandard: data.sizeStandard,
      barLength: data.barLength,
      weight: data.weight,
      equipmentName: data.equipmentName,
      remarks: data.remarks
    });

    // Make sure the supplier dropdown is filtered correctly for this equipment's
    // category, regardless of whether supplierList has finished loading yet.
    this.updateFilteredSuppliers(data.category);

    // Re-apply the correct conditional requirements now that category/type are set.
    this.updateConditionalValidators(data.category, data.type);

    // patching date for native date input (requires YYYY-MM-DD string)
    this.equipmentForm.patchValue({
      purchaseDate: moment(data.purchaseDate).format('YYYY-MM-DD'),
    });
  }
}
