import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AssignTrainerDialogComponent } from '../assign-trainer-dialog/assign-trainer-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MembershipCategoriesDialogComponent } from '../membership-categories-dialog/membership-categories-dialog.component';
import { MembershipCategoryService } from 'src/app/services/membership-category/membership-category.service';

const ELEMENT_DATA: any[] = [
  {
    member: 1,
    trainer: 'Hydrogen',
  }
];

@Component({
  selector: 'app-membership-categories',
  standalone: false,
  templateUrl: './membership-categories.component.html',
  styleUrl: './membership-categories.component.scss'
})
export class MembershipCategoriesComponent {

  displayedColumns: string[] = [
    'membershipCategory',
    'fee',
    'actions'
  ];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  /* calling constructor */
  constructor(
    private fb: FormBuilder,
    private membershipCategoryService: MembershipCategoryService,
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


  }

  // implementation of populateData function
  public populateData(): void {
    try {
      this.membershipCategoryService.getData().subscribe({
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
    const dialogRef = this.dialog.open(MembershipCategoriesDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
      }
    });
  }


  editData(data: any): void {
    const dialogRef = this.dialog.open(MembershipCategoriesDialogComponent, {
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
        message: `Are you sure you want to delete ${data.categoryName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.membershipCategoryService.deleteData(id).subscribe({
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

  public addNotification(details: any): void {
    this.notificationService.addNotification('Employee Added Successfully', 'success', 1);
  }

}
