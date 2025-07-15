import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-new-member-dialog',
  standalone: false,
  templateUrl: './new-member-dialog.component.html',
  styleUrl: './new-member-dialog.component.scss'
})
export class NewMemberDialogComponent {
  memberForm: FormGroup;
  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isButtonDisabled = false;
  submitted = false;
  selectedImageUrl;
  isFileSelected = false;
  submitDisabled;

  dataSource: MatTableDataSource<any>;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberServiceService,
    public dialogRef: MatDialogRef<NewMemberDialogComponent>,
    private sanitizer: DomSanitizer,
    private messageService: MessageServiceService
  ) {
    this.memberForm = this.fb.group({
      memberNo: new FormControl('', [
        Validators.required,
        Validators.maxLength(5),
        Validators.pattern(/^M\d{3}$/) // e.g., M001
      ]),
      firstName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[A-Za-z]+$/)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[A-Za-z]+$/)]),
      nic: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(12),
        Validators.pattern(/^[0-9]{9}[vVxX]$|^[1-2][0-9]{11}$/) // supports old and new formats
      ]),
      dateOfBirth: new FormControl('', [Validators.required, this.futureDateValidator]),
      address: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      emergencyContactNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      bloodType: new FormControl('', Validators.required),
      joinedDate: new FormControl('', [Validators.required, this.futureDateValidator]),
      gender: new FormControl('', Validators.required),
      injuries: new FormControl('', Validators.maxLength(300)),
      membershipCategory: new FormControl('', Validators.required),
      image: new FormControl(''),
      imageName: new FormControl(''),
      imageType: new FormControl('')
    });
  }

    futureDateValidator(control: AbstractControl) {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate > today ? { futureDate: true } : null;
    }
  

  /* OnSubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.memberForm.invalid) {
      return;
    }

    if (this.mode === 'add') {
      this.memberForm.patchValue({ status: 'Active' });

      try {
        this.memberService.serviceCall(this.prepareFormData()).subscribe({
          next: (response) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }

            // success message
            this.messageService.showSuccess('Member added successfully!');
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    } else if (this.mode === 'edit') {
      try {
        this.memberService.editData(this.selectedData?.id, this.prepareFormData()).subscribe({
          next: (response) => {
            const index = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[index] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // success message
            this.messageService.showSuccess('Member edited successfully!');
          },
          error: (error) => {
            this.messageService.showError('Action failed with error: ' + error);
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    }

    this.closeDialog();
  }

  onEdit(data: any): void {
    this.memberForm.patchValue({
      memberNo: data.memberNo,
      firstName: data.firstName,
      lastName: data.lastName,
      nic: data.nic,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      phoneNumber: data.phoneNumber,
      email: data.email,
      emergencyContactNumber: data.emergencyContactNumber,
      bloodType: data.bloodType,
      joinedDate: data.joinedDate,
      gender: data.gender,
      injuries: data.injuries,
      membershipCategory: data.membershipCategory,
      image: data.image,
      imageName: data.imageName,
      imageType: data.imageType
    });
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;

        this.submitDisabled = true;
                // patching date values after formatting
    this.memberForm.patchValue({
      joinedDate: new Date(data.joinedDate),
      dateOfBirth: new Date(data.dateOfBirth),
    });

    this.memberForm.valueChanges.subscribe(() => {
      this.submitDisabled = /* !this.memberForm.valid || */ this.memberForm.pristine;
    });
  }

  // Reset button function
  resetData() {
    this.memberForm.reset();
    this.memberForm.enable();
    this.registerButtonLabel = 'Register';
    this.mode = 'add';
    this.isButtonDisabled = false;
  }

  public prepareFormData(): FormData {
    const memberFormData = new FormData();
    // demoFormData.append('demoForm', this.demoForm.value);
    memberFormData.append('memberForm', new Blob([JSON.stringify(this.memberForm.value)], { type: 'application/json' }));

    if (this.isFileSelected) {
      memberFormData.append('image', this.memberForm.get('image').value, this.memberForm.get('image').value.name);
    } else {
      const imageBlob = this.base64ToBlob(this.memberForm.get('image').value, this.memberForm.get('imageType').value);
      const file = new File([imageBlob], this.memberForm.get('imageName').value, { type: this.memberForm.get('imageType').value });
      memberFormData.append('image', file, file.name);
    }

    return memberFormData;
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  public onFileSelected(event): void {
    if (event.target.files) {
      const file = event.target.files[0];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this.selectedImageUrl = url;
      this.isFileSelected = true;
      this.memberForm.get('image').setValue(file);
    }
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }
}
