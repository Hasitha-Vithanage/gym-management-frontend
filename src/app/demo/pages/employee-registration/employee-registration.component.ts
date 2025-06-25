import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, MinLengthValidator, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { NewEmployeeDialogComponent } from '../new-employee-dialog/new-employee-dialog.component';

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
  }

  // runs when load the page
  ngOnInit(): void {
    // get data request
    // calling populate data function
    this.populateData();
    this.userName = this.http.getLoginNameFromCache();
    console.log(this.userName);
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

    // Dialog Box
    readonly dialog = inject(MatDialog);
    openDialog(): void {
      const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
        autoFocus: false,
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.action === 'add') {
          this.dataSource.data = [result.data, ...this.dataSource.data];
        }
      });
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

  // Edit Data function
  editData(data: any): void {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        const newData = this.dataSource.data.filter(item => item.id !== result.data.id);
        // Add the updated item to the top
        this.dataSource.data = [result.data, ...newData];
      }
    });
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
