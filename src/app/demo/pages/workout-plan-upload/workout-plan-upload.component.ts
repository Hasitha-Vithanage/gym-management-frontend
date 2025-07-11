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
  deleteData(_t167: any) {
    throw new Error('Method not implemented.');
  }

  refreshData() {
    throw new Error('Method not implemented.');
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

}
