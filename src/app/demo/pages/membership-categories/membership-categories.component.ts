import { AfterViewInit, Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AssignTrainerDialogComponent } from '../assign-trainer-dialog/assign-trainer-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MembershipCategoriesDialogComponent } from './membership-categories-dialog/membership-categories-dialog.component';
import { MembershipCategoryService } from 'src/app/services/membership-category/membership-category.service';

const ELEMENT_DATA: any[] = [
  {
    member: 1,
    trainer: 'Hydrogen'
  }
];

@Component({
  selector: 'app-membership-categories',
  standalone: false,
  templateUrl: './membership-categories.component.html',
  styleUrl: './membership-categories.component.scss'
})
export class MembershipCategoriesComponent implements OnInit {
  displayedColumns: string[] = ['membershipCategory', 'fee', 'actions'];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  /* calling constructor */
  constructor(
    private fb: FormBuilder,
    private membershipCategoryService: MembershipCategoryService,
    private messageService: MessageServiceService,
    private http: HttpService,
    private notificationService: NotificationService
    // private dialog: MatDialog
  ) {}

  // runs when load the page
  ngOnInit(): void {
    // get data request
    // calling populate data function
    this.populateData();
  }

  // implementation of populateData function
  public populateData(): void {
    this.membershipCategoryService.getData().subscribe({
      next: (dataList: any[]) => {
        this.dataSource.data = dataList ?? [];

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
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
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(MembershipCategoriesDialogComponent, {
      autoFocus: false,
      data
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }
  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${data.categoryName}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== true) return;

      const id = data.id;

      this.membershipCategoryService.deleteData(id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter((x) => x.id !== id);
          this.messageService.showSuccess('Record deleted successfully!');
        },
        error: (error) => this.messageService.showError(error)
      });
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
