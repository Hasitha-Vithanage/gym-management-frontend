import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import moment from 'moment';
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
export class NewMemberDialogComponent implements OnInit {
  memberForm: FormGroup;
  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isButtonDisabled = false;
  submitted = false;
  selectedImageUrl;
  isFileSelected = false;
  submitDisabled;
  today: string = new Date().toISOString().split('T')[0];
  minDoj: string;
  maxDoj: string;

  dataSource: MatTableDataSource<any>;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberServiceService,
    public dialogRef: MatDialogRef<NewMemberDialogComponent>,
    private sanitizer: DomSanitizer,
    private messageService: MessageServiceService
  ) {
    this.memberForm = this.fb.group({
      memberNo: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern(/^M\d{3}$/)]),
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
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
      joinedDate: new FormControl('', [Validators.required, this.joiningDateValidator]),
      gender: new FormControl('', Validators.required),
      image: new FormControl(''),
      imageName: new FormControl(''),
      imageType: new FormControl('')
    });
  }
  ngOnInit(): void {
    const minDojDate = new Date();
    minDojDate.setFullYear(minDojDate.getFullYear() - 5);
    this.minDoj = minDojDate.toISOString().split('T')[0];

    const maxDojDate = new Date();
    maxDojDate.setFullYear(maxDojDate.getFullYear() + 1);
    this.maxDoj = maxDojDate.toISOString().split('T')[0];

    this.generateEmployeeId();
  }

  private generateEmployeeId(): void {
    this.memberService.getData().subscribe({
      next: (members: any) => {
        const maxNum = (members || []).reduce((max: number, member: any) => {
          const match = member.memberNo?.match(/^M(\d{3})$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        const nextId = `M${String(maxNum + 1).padStart(3, '0')}`;
        this.memberForm.get('memberNo').setValue(nextId);
      },
      error: () => {
        this.memberForm.get('memberNo').setValue('M001');
      }
    });
  }

  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { futureDate: true } : null;
  }

  joiningDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 5);
    minDate.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    maxDate.setHours(23, 59, 59, 999);
    if (inputDate < minDate) return { tooOld: true };
    if (inputDate > maxDate) return { tooFuture: true };
    return null;
  }

  /* OnSubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.memberForm.invalid) {
      this.messageService.showError('Please correct the errors in the form before submitting.');
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
            this.dialogRef.close({ action: 'add', data: response });
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    } else if (this.mode === 'edit') {
      try {
        this.memberService.editData(this.selectedData?.id, this.prepareFormData()).subscribe({
          next: (response) => {
            // success message
            this.messageService.showSuccess('Member edited successfully!');
            this.dialogRef.close({ action: 'edit', data: response });

            const index = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[index] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    }
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
      gender: (data.gender || '').toLowerCase(),
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
      joinedDate: new Date(data.joinedDate).toISOString().split('T')[0],
      dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0]
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
    this.memberForm.get('memberNo')?.disable();
    this.mode = 'add';
    this.isButtonDisabled = false;
    this.generateEmployeeId();
  }

  public prepareFormData(): FormData {
    const memberFormData = new FormData();
    // demoFormData.append('demoForm', this.demoForm.value);
    memberFormData.append('memberForm', new Blob([JSON.stringify(this.memberForm.getRawValue())], { type: 'application/json' }));

    if (this.isFileSelected) {
      memberFormData.append('image', this.memberForm.get('image').value, this.memberForm.get('image').value.name);
    } else if (this.memberForm.get('image').value && this.memberForm.get('imageType').value) {
      const imageBlob = this.base64ToBlob(this.memberForm.get('image').value, this.memberForm.get('imageType').value);
      const file = new File([imageBlob], this.memberForm.get('imageName').value || 'image', { type: this.memberForm.get('imageType').value });
      memberFormData.append('image', file, file.name);
    }
    // else: no existing image and no new one selected — omit the part entirely
    // rather than round-tripping null through atob(), which silently decodes
    // the literal string "null" into 3 bytes of garbage binary data.

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
