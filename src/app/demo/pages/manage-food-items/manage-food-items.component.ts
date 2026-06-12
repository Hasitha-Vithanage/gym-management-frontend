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
import { FoodItemService } from 'src/app/services/food-item/food-item.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddFoodItemComponent } from './add-food-item/add-food-item.component';

@Component({
  selector: 'app-manage-food-items',
  standalone: false,
  templateUrl: './manage-food-items.component.html',
  styleUrl: './manage-food-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageFoodItemsComponent implements OnInit {

  displayedColumns: string[] = [
    'foodName', 'category', 'caloriesPer100g', 'proteinG', 'carbsG', 'fatG', 'servingDescription', 'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dialog: MatDialog = inject(MatDialog);

  constructor(
    private foodItemService: FoodItemService,
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

  populateData(): void {
    this.foodItemService.getAllFoodItems().subscribe({
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
    const dialogRef = this.dialog.open(AddFoodItemComponent, { autoFocus: false });
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(AddFoodItemComponent, { autoFocus: false });
    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete "${data.foodName}"?` }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.foodItemService.deleteFoodItem(data.id).subscribe({
          next: () => {
            const updated = this.dataSource.data.filter((item) => item.id !== data.id);
            this.dataSource = new MatTableDataSource(updated);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.messageService.showSuccess('Food item deleted successfully!');
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
