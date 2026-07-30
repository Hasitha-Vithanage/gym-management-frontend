import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-new-employee-dialog',
  standalone: false,
  templateUrl: './new-employee-dialog.component.html',
  styleUrl: './new-employee-dialog.component.scss'
})
export class NewEmployeeDialogComponent implements OnInit {

  employeeForm: FormGroup;
  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  dataSource: MatTableDataSource<any>;
  today: string = new Date().toISOString().split('T')[0];
  minDoj: string;
  maxDoj: string;
  submitDisabled: boolean;
  selectedImageUrl;
  isFileSelected = false;


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewEmployeeDialogComponent>,
    private http: HttpService,
    private employeeService: EmpolyeeServiceService,
    private messageService: MessageServiceService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const minDojDate = new Date();
    minDojDate.setFullYear(minDojDate.getFullYear() - 5);
    this.minDoj = minDojDate.toISOString().split('T')[0];

    const maxDojDate = new Date();
    maxDojDate.setFullYear(maxDojDate.getFullYear() + 1);
    this.maxDoj = maxDojDate.toISOString().split('T')[0];

    this.employeeForm = this.fb.group({
      employeeId: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^E\d{3}$/)]],
      jobTitle: ['', Validators.required],
      dateOfJoining: ['', [Validators.required, this.joiningDateValidator.bind(this)]],
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[A-Za-z]+$/)]],
      nic: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(12), Validators.pattern(/^[0-9]{9}[vVxX]$|^[1-2][0-9]{11}$/)]],
      dateOfBirth: ['', [Validators.required, this.futureDateValidator]],
      gender: ['', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emergencyContactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      image: new FormControl(''),
      imageName: new FormControl(''),
      imageType: new FormControl('')
    });

    this.generateEmployeeId();
  }

  private generateEmployeeId(): void {
    this.employeeService.getData().subscribe({
      next: (employees: any[]) => {
        const maxNum = (employees || []).reduce((max, emp) => {
          const match = emp.employeeId?.match(/^E(\d{3})$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        const nextId = `E${String(maxNum + 1).padStart(3, '0')}`;
        this.employeeForm.get('employeeId').setValue(nextId);
      },
      error: () => {
        this.employeeForm.get('employeeId').setValue('E001');
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


  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    if (this.employeeForm.invalid) {
      this.messageService.showError('Please correct the errors in the form before submitting.');
      return;
    }

    if (this.mode === 'add') {
      this.employeeForm.patchValue({ status: 'Active' });

      this.employeeService.serviceCall(this.prepareFormData()).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Employee added successfully!');
          this.dialogRef.close({ action: 'add', data: response });
        },
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    } else if (this.mode === 'edit') {
      this.employeeService.editData(this.selectedData?.id, this.prepareFormData()).subscribe({
        next: (response) => {
          this.messageService.showSuccess('Employee edited successfully!');
          this.dialogRef.close({ action: 'edit', data: response });
        },
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    }
  }

  onEdit(data: any): void {
    this.employeeForm.patchValue({
      employeeId: data.employeeId,
      jobTitle: data.jobTitle,
      firstName: data.firstName,
      lastName: data.lastName,
      nic: data.nic,
      gender: data.gender,
      address: data.address,
      email: data.email,
      phoneNumber: data.phoneNumber,
      emergencyContactNumber: data.emergencyContactNumber,
      image: data.image,
      imageName: data.imageName,
      imageType: data.imageType
    });
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.employeeForm.patchValue({
      dateOfJoining: new Date(data.dateOfJoining).toISOString().split('T')[0],
      dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
    });

    this.employeeForm.valueChanges.subscribe(() => {
      this.submitDisabled = this.employeeForm.pristine;
    });
  }

  // reset button function
  public resetData(): void {
    this.employeeForm.reset();
    this.employeeForm.setErrors = null;
    this.employeeForm.updateValueAndValidity();
    this.employeeForm.enable();
    this.employeeForm.get('employeeId').disable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Register';
    this.generateEmployeeId();
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }

  public addNotification(details: any): void {
    this.notificationService.addNotification('Employee Added Successfully', 'success', 1);
  }

  public prepareFormData(): FormData {
    const employeeFormData = new FormData();
    employeeFormData.append('employeeForm', new Blob([JSON.stringify(this.employeeForm.getRawValue())], { type: 'application/json' }));

    if (this.isFileSelected) {
      employeeFormData.append('image', this.employeeForm.get('image').value, this.employeeForm.get('image').value.name);
    } else {
      const imageBlob = this.base64ToBlob(this.employeeForm.get('image').value, this.employeeForm.get('imageType').value);
      const file = new File([imageBlob], this.employeeForm.get('imageName').value, { type: this.employeeForm.get('imageType').value });
      employeeFormData.append('image', file, file.name);
    }

    return employeeFormData;
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
      this.employeeForm.get('image').setValue(file);
    }
  }
}
