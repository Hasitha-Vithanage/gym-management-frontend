import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { NewEmployeeDialogComponent } from '../new-employee-dialog/new-employee-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddExerciseComponent } from './add-exercise/add-exercise.component';

@Component({
  selector: 'app-manage-exercise',
  standalone: false,
  templateUrl: './manage-exercise.component.html',
  styleUrl: './manage-exercise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageExerciseComponent implements OnInit {
  displayedColumns: string[] = [
    'exerciseName',
    'muscleGroup',
    'muscleGroupSecondary',
    'exerciseType',
    'movementType',
    'difficultyLevel',
    'actions'
  ];

  registerButtonLabel: string = 'Register';
  mode: string = 'add';
  selectedData: any;
  isDisabled: boolean = false;
  submitted: boolean = false;
  userName: string = '';
  noData: boolean = false;

  readonly dialog: MatDialog = inject(MatDialog);

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private employeeService: EmpolyeeServiceService,
    private messageService: MessageServiceService,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.populateData();
    this.userName = this.http.getLoginNameFromCache();
    console.log(this.userName);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openExerciseDialog(): void {
    const dialogRef = this.dialog.open(AddExerciseComponent, {
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.populateData();
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
        this.populateData();
      }
    });
  }

  public populateData(): void {
    try {
      this.employeeService.getData().subscribe({
        next: (dataList: any[]) => {
          if (dataList.length <= 0) {
            return;
          }

          console.log('Employees: ', dataList);
          const activeEmployees = dataList.filter((emp) => !emp.isDeleted);
          this.dataSource = new MatTableDataSource(activeEmployees);

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(NewEmployeeDialogComponent, {
      autoFocus: false
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        const newData = this.dataSource.data.filter((item) => item.id !== result.data.id);
        this.dataSource.data = [result.data, ...newData];
      }
    });
  }

  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${data.firstName} ${data.lastName}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const id = data.id;
        this.employeeService.deleteData(id).subscribe({
          next: () => {
            const index = this.dataSource.data.findIndex((item) => item.id === id);
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

  public refreshData(): void {
    this.populateData();
  }
}
