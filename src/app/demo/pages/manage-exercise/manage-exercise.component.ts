import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddExerciseService } from 'src/app/services/add-exercise/add-exercise.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
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

  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dialog: MatDialog = inject(MatDialog);

  constructor(
    private exerciseService: AddExerciseService,
    private messageService: MessageServiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.populateData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public populateData(): void {
    this.exerciseService.getAllExercises().subscribe({
      next: (dataList: any[]) => {
        const activeExercises = dataList.filter((e) => !e.isDeleted);
        this.dataSource = new MatTableDataSource(activeExercises);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }

  openExerciseDialog(): void {
    const dialogRef = this.dialog.open(AddExerciseComponent, {
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'add') {
        this.dataSource = new MatTableDataSource([result.data, ...this.dataSource.data]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      }
    });
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(AddExerciseComponent, {
      autoFocus: false
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        const updatedData = this.dataSource.data.map((item) =>
          item.id === result.data.id ? result.data : item
        );
        this.dataSource = new MatTableDataSource(updatedData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      }
    });
  }

  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete "${data.exerciseName}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.exerciseService.deleteExercise(data.id).subscribe({
          next: () => {
            const updatedData = this.dataSource.data.filter((item) => item.id !== data.id);
            this.dataSource = new MatTableDataSource(updatedData);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.messageService.showSuccess('Exercise deleted successfully!');
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.messageService.showError(error.message ?? error);
          }
        });
      }
    });
  }

  public refreshData(): void {
    this.populateData();
  }
}