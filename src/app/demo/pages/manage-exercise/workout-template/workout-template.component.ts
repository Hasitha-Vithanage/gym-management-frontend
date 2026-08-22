import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { AddWorkoutTemplateComponent } from './add-workout-template/add-workout-template.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { WorkoutTemplatesService } from 'src/app/services/workout-templates/workout-templates.service';

@Component({
  selector: 'app-workout-template',
  standalone: false,
  templateUrl: './workout-template.component.html',
  styleUrl: './workout-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutTemplateComponent implements OnInit {
  displayedColumns: string[] = [
    'templateName',
    'goal',
    'difficultyLevel',
    'durationMinutes',
    'daysPerWeek',
    'location',
    'suitableFor',
    'status',
    'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dialog: MatDialog = inject(MatDialog);

  constructor(
    private workoutService: WorkoutTemplatesService,
    private messageService: MessageServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.populateData();

    // If navigated here from a pending custom request, auto-open the dialog with context
    this.route.queryParams.subscribe((params) => {
      if (params['pendingRequestId']) {
        this.openWorkoutTemplateDialogForRequest(params);
      }
    });
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
    this.workoutService.getAllWorkoutTemplates().subscribe({
      next: (dataList: any[]) => {
        const activeTemplates = dataList.filter((e) => !e.deleted);
        this.dataSource = new MatTableDataSource(activeTemplates);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.messageService.showError(error.message ?? error);
      }
    });
  }

  assignExercises(template: any): void {
    this.router.navigate(['/pages/exercise-to-template', template.id]);
  }

  openWorkoutTemplateDialogForRequest(params: any): void {
    const dialogRef = this.dialog.open(AddWorkoutTemplateComponent, {
      autoFocus: false,
      panelClass: 'ff-dialog',
      data: {
        pendingRequestId: params['pendingRequestId'],
        memberUserId: params['memberUserId'],
        memberName: params['memberName'],
        goal: params['goal'],
        level: params['level']
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.populateData();
      if (result?.action === 'add') {
        this.router.navigate(['/pages/exercise-to-template', result.data.id], {
          queryParams: {
            pendingRequestId: params['pendingRequestId'],
            memberUserId: params['memberUserId'],
            memberName: params['memberName']
          }
        });
      }
    });
  }

  openWorkoutTemplateDialog(): void {
    const dialogRef = this.dialog.open(AddWorkoutTemplateComponent, {
      autoFocus: false,
      panelClass: 'ff-dialog'
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(AddWorkoutTemplateComponent, {
      autoFocus: false,
      panelClass: 'ff-dialog'
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `Are you sure you want to delete "${data.exerciseName}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.workoutService.deleteWorkoutTemplate(data.id).subscribe({
          next: () => {
            const updatedData = this.dataSource.data.filter((item) => item.id !== data.id);
            this.dataSource = new MatTableDataSource(updatedData);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.messageService.showSuccess('Workout template deleted successfully!');
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
