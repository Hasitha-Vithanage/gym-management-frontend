import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NewEmployeeDialogComponent } from '../new-employee-dialog/new-employee-dialog.component';
import { QrCodeComponent } from '../qr-container/qr-code/qr-code.component';
import { RatingAndFeedbackServiceService } from 'src/app/services/rating-and-feedback/rating-and-feedback-service.service';

@Component({
  selector: 'app-all-feedbacks',
  standalone: false,
  templateUrl: './all-feedbacks.component.html',
  styleUrl: './all-feedbacks.component.scss'
})
export class AllFeedbacksComponent {

  displayedColumns: string[] = [
    'category',
    'trainer',
    'rating',
    'feedback',
    'submittedDate',
    'submittedBy',
    'actions'
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

    ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;

  /* calling constructor */
  constructor(
    private http: HttpService,
    private feedbackService: RatingAndFeedbackServiceService,
    private messageService: MessageServiceService,
    // private dialog: MatDialog
  ) {
  }

  // runs when load the page
  ngOnInit(): void {
    // get data request
    // calling populate data function
    this.populateData();
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

  // implementation of populateData function
  public populateData(): void {

    try {
      this.feedbackService.getData().subscribe({
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

  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete this ${data.category} feedback?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.feedbackService.deleteData(id).subscribe({
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
