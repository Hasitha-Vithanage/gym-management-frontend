import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddClassDialogComponent } from '../add-class-dialog/add-class-dialog.component';
import { AddClassService } from 'src/app/services/add-class/add-class.service';

@Component({
  selector: 'app-add-class',
  standalone: false,
  templateUrl: './add-class.component.html',
  styleUrl: './add-class.component.scss'
})
export class AddClassComponent {

  displayedColumns: string[] = [
    'classTitle',
    'description',
    'date',
    'startTime',
    'endTime',
    'conductorName',
    'profession',
    'totalSlots',
    'remainingSlots',
    'fee',
    'status',
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
    private addClassService: AddClassService,
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

  formatTime(data: any[]): string {
    try {
    // Split hours/minutes/seconds
    const time = data.join(':');
    const [hour, minute, second] = time.split(':').map(Number);

    // Create a Date in local time zone (no need to deal with UTC)
    const date = new Date();
    date.setHours(hour, minute, second || 0, 0);  // hour, minute, second, ms

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error('Time parse error:', e);
    return 'Invalid Time';
  }
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
    const dialogRef = this.dialog.open(AddClassDialogComponent, {
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
      this.addClassService.getData().subscribe({
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
    const dialogRef = this.dialog.open(AddClassDialogComponent, {
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



  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${data.classTitle}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.addClassService.deleteData(id).subscribe({
          next: () => {
            const index = this.dataSource.data.findIndex(item => item.id === id);
            if (index !== -1) {
              this.dataSource.data.splice(index, 1);
            }
            this.dataSource = new MatTableDataSource(this.dataSource.data);
            this.messageService.showSuccess('Record deleted successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
    });
  }

  //refresh button function
  public refreshData(): void {
    this.populateData();
  }
}
