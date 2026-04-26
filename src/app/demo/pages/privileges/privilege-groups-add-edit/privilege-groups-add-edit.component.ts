import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { PrivilegesService } from 'src/app/services/privileges/privileges.service';

@Component({
  selector: 'app-privilege-groups-add-edit',
  standalone: false,
  templateUrl: './privilege-groups-add-edit.component.html',
  styleUrls: ['./privilege-groups-add-edit.component.scss'],
})
export class PrivilegeGroupsAddEditComponent {
  privilegeGroupForm: FormGroup;
  submitted = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private privilegesService: PrivilegesService,
    private dialogRef: MatDialogRef<PrivilegeGroupsAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private messageService: MessageServiceService
  ) {
    this.privilegeGroupForm = this.fb.group({
      groupName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          this.noWhitespaceValidator
        ]
      ],
      groupDescription: ['', [Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.privilegeGroupForm.patchValue(this.data);
    }
  }

  // 🚫 Prevent only spaces
  noWhitespaceValidator(control: AbstractControl) {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  // 🚀 Submit
  public onFormSubmit(): void {
    this.submitted = true;

    if (this.privilegeGroupForm.invalid) {
      this.messageService.showError('Please fill required fields correctly.');
      return;
    }

    const payload = this.privilegeGroupForm.value;

    try {
      if (this.isEditMode) {
        this.privilegesService
          .editPrivilegeGroup(this.data.id, payload)
          .then((response: any) => {
            this.dialogRef.close({ action: 'edit', data: response });
          });

      } else {
        this.privilegesService
          .addPrivilegeGroup(payload)
          .then((response: any) => {
            this.dialogRef.close({ action: 'add', data: response });
          });
      }

    } catch (error) {
      console.error(error);
      this.messageService.showError('Something went wrong.');
    }
  }

  // ❌ Close
  closeDialog(): void {
    this.dialogRef.close();
  }

  // 🔄 Reset
  resetForm(): void {
    this.privilegeGroupForm.reset();
    this.submitted = false;
  }
}
