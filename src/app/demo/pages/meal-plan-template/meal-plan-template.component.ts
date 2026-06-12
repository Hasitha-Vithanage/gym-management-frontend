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
import { Router } from '@angular/router';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddMealPlanTemplateComponent } from './add-meal-plan-template/add-meal-plan-template.component';

@Component({
  selector: 'app-meal-plan-template',
  standalone: false,
  templateUrl: './meal-plan-template.component.html',
  styleUrl: './meal-plan-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealPlanTemplateComponent implements OnInit {

  displayedColumns: string[] = [
    'templateName', 'goal', 'dailyCalorieTarget', 'durationWeeks', 'foodItemCount', 'status', 'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dialog: MatDialog = inject(MatDialog);

  constructor(
    private templateService: MealPlanTemplateService,
    private messageService: MessageServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router
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

  populateData(): void {
    this.templateService.getAllTemplates().subscribe({
      next: (data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      },
      error: (error) => this.messageService.showError(error.message ?? error)
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddMealPlanTemplateComponent, { autoFocus: false });
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(AddMealPlanTemplateComponent, { autoFocus: false });
    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  assignFoods(template: any): void {
    this.router.navigate(['/pages/food-to-template', template.id]);
  }

  deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete "${data.templateName}"?` }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.templateService.deleteTemplate(data.id).subscribe({
          next: () => {
            const updated = this.dataSource.data.filter((item) => item.id !== data.id);
            this.dataSource = new MatTableDataSource(updated);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.messageService.showSuccess('Template deleted successfully!');
            this.cdr.markForCheck();
          },
          error: (error) => this.messageService.showError(error.message ?? error)
        });
      }
    });
  }

  refreshData(): void {
    this.populateData();
  }
}
