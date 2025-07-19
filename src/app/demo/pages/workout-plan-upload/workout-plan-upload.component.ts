import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { WorkoutPlanUploadService } from 'src/app/services/workout-plan-upload/workout-plan-upload.service';
import { UploadWorkoutPlanDialogComponent } from '../upload-workout-plan-dialog/upload-workout-plan-dialog.component';
import { error } from 'console';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-workout-plan-upload',
  standalone: false,
  templateUrl: './workout-plan-upload.component.html',
  styleUrl: './workout-plan-upload.component.scss'
})
export class WorkoutPlanUploadComponent implements OnInit {

  viewData(_t64: any) {
    throw new Error('Method not implemented.');
  }

  refreshData() {
    this.populateData();
  }
  openDialog() {
    throw new Error('Method not implemented.');
  }

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = [
    'member',
    'date',
    'status',
    'actions'
  ];

  /* calling constructor */
  constructor(
    private fb: FormBuilder,
    private uploadWorkoutService: WorkoutPlanUploadService,
    private messageService: MessageServiceService,
    private http: HttpService,
    private notificationService: NotificationService,
    // private dialog: MatDialog
  ) {
  }
  ngOnInit(): void {

    this.populateData();
  }


  // implementation of populateData function
  public populateData(): void {
    try {
      this.uploadWorkoutService.getData().subscribe({
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


  readonly dialog = inject(MatDialog);
  uploadPlan(data: any) {
    const dialogRef = this.dialog.open(UploadWorkoutPlanDialogComponent, {
      autoFocus: false,
      data: data
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.populateData();
      if (result?.action === 'edit') {
        const newData = this.dataSource.data.filter(item => item.id !== result.data.id);
        // Add the updated item to the top
        this.dataSource.data = [result.data, ...newData];


      }
    });
  }


  // // delete button function
  // public deleteData(data: any): void {
  //   const id = data.id;
  //   try {
  //     // calling deleteData function to send the delete request to the backend
  //     this.uploadWorkoutService.deleteRecord(id).subscribe({
  //       next: (respone: any) => {
  //         const index = this.dataSource.data.findIndex((element) => element.id === id);

  //         if (index != -1) {
  //           this.dataSource.data.splice(index, 1);
  //         }
  //         this.dataSource = new MatTableDataSource(this.dataSource.data);

  //         // displaying success message
  //         this.messageService.showSuccess('Workout Plan Request record deleted successfully!');
  //       },
  //       // displaying error message
  //       error: (error) => {
  //         this.messageService.showError(error);
  //       }
  //     });
  //   } catch (error) {
  //     this.messageService.showError(error);
  //   }
  // }


  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${data.userId}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.uploadWorkoutService.deleteRecord(id).subscribe({
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
}
