import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { NewEmployeeDialogComponent } from '../new-employee-dialog/new-employee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { QrCodeComponent } from '../qr-container/qr-code/qr-code.component';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { title } from 'process';

@Component({
  selector: 'app-for-your-approval',
  standalone: false,
  templateUrl: './for-your-approval.component.html',
  styleUrl: './for-your-approval.component.scss'
})
export class ForYourApprovalComponent {

  displayedColumns: string[] = [
    '#',
    'firstName',
    'lastName',
    'role',
    'requestedDate',
    // 'approvedDate',
    // 'approvedBy',
    'status',
    'actions'
  ];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  noData: boolean;

  /* calling constructor */
  constructor(
    private fb: FormBuilder,
    private employeeService: EmpolyeeServiceService,
    private userProfileService: UserProfileService,
    private messageService: MessageServiceService,
    private http: HttpService,
    private notificationService: NotificationService,
    // private dialog: MatDialog
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
  openEmployeeDialog(): void {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.populateData();
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
        this.populateData();
      }
    });
  }

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

  public approveRequest(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Approve User Request',
        message: `Are you sure you want to approve ${data.firstName} ${data.lastName} request?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.userProfileService.approveUser(id).subscribe({
          next: () => {
            const index = this.dataSource.data.findIndex(item => item.id === id);
            if (index !== -1) {
              this.dataSource.data.splice(index, 1);
            }
            this.dataSource = new MatTableDataSource(this.dataSource.data);
            this.messageService.showSuccess('User approved successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
    });
  }

  // implementation of populateData function
  public populateData(): void {
    try {

      this.userProfileService.getAllUsers().subscribe({
        next: (dataList: any[]) => {
          if (dataList.length <= 0) {
            return;
          }

          console.log("Users: ", dataList);

          // getting only approval pending users
          const pendingUsers = dataList.filter(user => user.status === 'Approval Pending' && user.role === 'Member');
          this.dataSource = new MatTableDataSource(pendingUsers);

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

  //refresh button function
  public refreshData(): void {
    this.populateData();
  }

  public rejectRequest(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Reject User Request',
        message: `Are you sure you want to reject ${data.firstName} ${data.lastName} request?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.userProfileService.rejectUser(id).subscribe({
          next: () => {
            const index = this.dataSource.data.findIndex(item => item.id === id);
            if (index !== -1) {
              this.dataSource.data.splice(index, 1);
            }
            this.dataSource = new MatTableDataSource(this.dataSource.data);
            this.messageService.showSuccess('User rejected successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
    });
  }
}
