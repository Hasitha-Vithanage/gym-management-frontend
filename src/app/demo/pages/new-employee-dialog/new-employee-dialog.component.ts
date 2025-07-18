import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { NewEquipmentDialogComponent } from '../new-equipment-dialog/new-equipment-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

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
  submitDisabled;


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewEmployeeDialogComponent>,
    private http: HttpService,
    private employeeService: EmpolyeeServiceService,
    private messageService: MessageServiceService,
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
    });

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

    console.log('Clicked');
    console.log(this.employeeForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        this.employeeService.serviceCall(this.employeeForm.value).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Employee added successfully!');

            this.addNotification(response);
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        // Calling editData function to send the request to the backend
        this.employeeService.editData(this.selectedData?.id, this.employeeForm.value).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // Displaying success message
            this.messageService.showSuccess('Employee details updated successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
      // this.employeeForm.disable();
      this.isDisabled = true;
      this.mode = 'add';
    } catch (error) {
      this.messageService.showError(error);
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
}
