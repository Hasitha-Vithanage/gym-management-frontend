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
import { SupplementProductService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NewSupplementDialogComponent } from '../new-supplement-dialog/new-supplement-dialog.component';

@Component({
  selector: 'app-supplement-inventory-management',
  standalone: false,
  templateUrl: './supplement-inventory-management.component.html',
  styleUrl: './supplement-inventory-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplementInventoryManagementComponent implements OnInit {

  displayedColumns: string[] = [
    'productName', 'brand', 'category', 'price', 'stockQty', 'status', 'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dialog: MatDialog = inject(MatDialog);

  constructor(
    private supplementService: SupplementProductService,
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
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  populateData(): void {
    this.supplementService.getProductsForStaff().subscribe({
      next: (data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      },
      error: (error) => this.messageService.showError(error?.error?.message ?? error?.message ?? 'Failed to load products.')
    });
  }

  refreshData(): void {
    this.populateData();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(NewSupplementDialogComponent, { autoFocus: false });
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  editData(data: any): void {
    const dialogRef = this.dialog.open(NewSupplementDialogComponent, { autoFocus: false });
    dialogRef.afterOpened().subscribe(() => dialogRef.componentInstance.onEdit(data));
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete "${data.productName}"?` }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.supplementService.deleteProduct(data.id).subscribe({
          next: () => {
            const updated = this.dataSource.data.filter((item) => item.id !== data.id);
            this.dataSource = new MatTableDataSource(updated);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.messageService.showSuccess('Supplement deleted successfully!');
            this.cdr.markForCheck();
          },
          error: (error) => this.messageService.showError(error?.error?.message ?? error?.message ?? 'Delete failed.')
        });
      }
    });
  }
}
