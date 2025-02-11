import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { PrivilegesService } from 'src/app/services/privileges/privileges.service';

@Component({
  selector: 'app-privilege-groups-add-edit',
  standalone: false,
  templateUrl: './privilege-groups-add-edit.component.html',
  styleUrl: './privilege-groups-add-edit.component.scss',
})
export class PrivilegeGroupsAddEditComponent {
  privilegeGroupForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _privilegesService: PrivilegesService,
    private _dialogRef: MatDialogRef<PrivilegeGroupsAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // private _coreService: CoreService
    private _messageService: MessageServiceService
  ) {
    this.privilegeGroupForm = this._fb.group({
      groupName: ['', [Validators.required]],
      groupDescription: [''],
    });
  }

  ngOnInit(): void {
    this.privilegeGroupForm.patchValue(this.data);
  }

  public onFormSubmit(): void {
    try {
      if (!this.privilegeGroupForm.valid) {
        console.log('Form is not valid');
        return;
      }

      if (this.data) {
        this._privilegesService
          .editPrivilegeGroup(this.data.id, this.privilegeGroupForm.value)
          .then((response: any) => {
            console.log(response);
            this._dialogRef.close(true);
          });
      } else {
        this._privilegesService
          .addPrivilegeGroup(this.privilegeGroupForm.value)
          .then((response: any) => {
            console.log(response);
            // handle response
            this._dialogRef.close(true);
          });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
