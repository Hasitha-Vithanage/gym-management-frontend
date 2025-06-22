import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, MinLengthValidator, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

const ELEMENT_DATA: any[] = [
  {
    employeeId: 1,
    jobTitle: 'Hydrogen',
    dateOfJoining: 1.0079,
    firstName: 'H',
    lastName: 1,
    nic: 'Hydrogen',
    dateOfBirth: 1.0079,
    gender: 'H',
    address: 1.0079,
    email: 'H',
    phoneNumber: 'H',
    emergencyContactNumber: 1.0079
  }
];

@Component({
  selector: 'app-employee-registration',
  standalone: false,
  templateUrl: './employee-registration.component.html',
  styleUrl: './employee-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeRegistrationComponent implements OnInit {
  /* creating form group variable */
  employeeForm: FormGroup;

  displayedColumns: string[] = [
    'employeeId',
    'jobTitle',
    'dateOfJoining',
    'firstName',
    'lastName',
    'nic',
    'dateOfBirth',
    'gender',
    'address',
    'email',
    'phoneNumber',
    'emergencyContactNumber',
    'actions'
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;

  /* calling constructor */
  constructor(
    private fb: FormBuilder,
    private employeeService: EmpolyeeServiceService,
    private messageService: MessageServiceService,
    private http: HttpService,
    private notificationService: NotificationService
  ) {
    this.employeeForm = new FormGroup({
      employeeId: new FormControl('', [Validators.required, Validators.minLength(5)]),
      jobTitle: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      nic: new FormControl('', [Validators.required, Validators.minLength(12)]),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), this.customDecimalValidator]),
      emergencyContactNumber: new FormControl('', [Validators.minLength(10), this.customDecimalValidator])
    });
  }

  // runs when load the page
  ngOnInit(): void {
    // get data request
    // calling populate data function
    this.populateData();
    this.userName = this.http.getLoginNameFromCache();
    console.log(this.userName);
  }

  // custom validation
  customDecimalValidator(control: AbstractControl) {
    if (!control) {
      return null;
    }

    const controlValue = +control.value;

    if (isNaN(+control.value)) {
      return {
        customDecimalValidator: true
      };
    }
    if (!Number.isInteger(controlValue)) {
      return {
        customDecimalValidator: true
      };
    }
    return null;
  }

  // table filter function
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // pagination code
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // implementation of populateData function
  public populateData(): void {
    try {
      this.employeeService.getData().subscribe({
        next: (dataList: any[]) => {
          if (dataList.length <= 0) {
            return;
          }

          this.dataSource = new MatTableDataSource(dataList);

          // sorting and pagination
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        // displaying error message
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    } catch (error) {
      this.messageService.showError(error);
    }
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

            // this.addNotification(response);
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
      this.employeeForm.disable();
      this.isDisabled = true;
      this.mode = 'add';
    } catch (error) {
      this.messageService.showError(error);
    }
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

  // edit button function
  public editData(data: any): void {
    console.log(new Date(data.dateOfBirth));
    this.employeeForm.patchValue(data);

    // patching date values after formatting
    this.employeeForm.patchValue({
      dateOfBirth: new Date(data.dateOfBirth),
      dateOfJoining: new Date(data.dateOfJoining)
    });

    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
  }

  // delete button function
  public deleteData(data: any): void {
    const id = data.id;
    try {
      // calling deleteData function to send the delete request to the backend
      this.employeeService.deleteData(id).subscribe({
        next: (respone: any) => {
          const index = this.dataSource.data.findIndex((element) => element.id === id);

          if (index != -1) {
            this.dataSource.data.splice(index, 1);
          }
          this.dataSource = new MatTableDataSource(this.dataSource.data);

          // displaying success message
          this.messageService.showSuccess('Employee record deleted successfully!');
        },
        // displaying error message
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  //refresh button function
  public refreshData(): void {
    this.populateData();
  }

  public addNotification(details: any): void {
    this.notificationService.addNotification('Employee Added Successfully', 'success', 1);
  }
}
