import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { NewEquipmentDialogComponent } from '../new-equipment-dialog/new-equipment-dialog.component';
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
export class NewEmployeeDialogComponent {

  employeeForm: FormGroup;
  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  dataSource: MatTableDataSource<any>;
  today: Date = new Date();
  submitDisabled: boolean = true;
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
  ) {

  }

  ngOnInit() {

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const userName = this.http.getLoginNameFromCache();

    this.employeeForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^E\d{3}$/)]],
      jobTitle: ['', Validators.required],
      dateOfJoining: ['', [Validators.required, this.futureDateValidator]],
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

    // Enable submit button only when form is valid
    if (this.employeeForm.valid) {
      this.submitDisabled = false;
    }

  }

  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { futureDate: true } : null;
  }


  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.employeeForm.invalid) {
      return;
    }

    if (this.mode === 'add') {
      this.employeeForm.patchValue({ status: 'Active' });

      try {
        this.employeeService.serviceCall(this.prepareFormData()).subscribe({
          next: (response) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }

            // success message
            this.messageService.showSuccess('Employee added successfully!');
          },
          error: (error) => {
            const errorMessage =
              error?.error?.message || error?.error || 'Something went wrong.';
            this.messageService.showError(errorMessage);
          }
        });
      } catch (error) {
        this.messageService.showError(error);
      }
    } else if (this.mode === 'edit') {
      try {
        this.employeeService.editData(this.selectedData?.id, this.prepareFormData()).subscribe({
          next: (response) => {

            // success message
            this.messageService.showSuccess('Employee edited successfully!');

            const index = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[index] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);


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
    this.employeeForm.patchValue({
      employeeId: data.employeeId,
      jobTitle: data.jobTitle,
      dateOfJoining: data.dateOfJoining,
      firstName: data.firstName,
      lastName: data.lastName,
      nic: data.nic,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      email: data.email,
      phoneNumber: data.phoneNumber,
      emergencyContactNumber: data.emergencyContactNumber,
      image: data.image,
      imageName: data.imageName,
      imageType: data.imageType
    });
    this.registerButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;

    this.submitDisabled = true;

    // patching date values after formatting
    this.employeeForm.patchValue({
      dateOfJoining: new Date(data.dateOfJoining),
      dateOfBirth: new Date(data.dateOfBirth),
    });

    this.employeeForm.valueChanges.subscribe(() => {
      this.submitDisabled = /* !this.employeeForm.valid || */ this.employeeForm.pristine;
    });
  }

  // reset button function
  public resetData(): void {
    this.employeeForm.reset();
    this.employeeForm.setErrors = null;
    this.employeeForm.updateValueAndValidity();
    this.employeeForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Register';
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
    // demoFormData.append('demoForm', this.demoForm.value);
    employeeFormData.append('employeeForm', new Blob([JSON.stringify(this.employeeForm.value)], { type: 'application/json' }));

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
