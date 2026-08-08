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
import { SupplementOrderService } from 'src/app/services/supplement-orders/supplement-orders.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sales-and-requests',
  standalone: false,
  templateUrl: './sales-and-requests.component.html',
  styleUrl: './sales-and-requests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesAndRequestsComponent implements OnInit {

  displayedColumns: string[] = [
    'memberUsername', 'orderDate', 'itemCount', 'totalAmount', 'status', 'actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dialog: MatDialog = inject(MatDialog);

  constructor(
    private orderService: SupplementOrderService,
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

  private parseDate(d: any): Date | null {
    if (!d) return null;
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], d[3] ?? 0, d[4] ?? 0, d[5] ?? 0);
    return new Date(d);
  }

  populateData(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data: any[]) => {
        const mapped = data.map(o => ({ ...o, orderDate: this.parseDate(o.orderDate) }));
        this.dataSource = new MatTableDataSource(mapped);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
      },
      error: (error) => this.messageService.showError(error)
    });
  }

  refreshData(): void {
    this.populateData();
  }

  completeOrder(order: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Mark order #${order.id} from "${order.memberUsername}" as Completed?` }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.orderService.completeOrder(order.id).subscribe({
          next: () => {
            this.messageService.showSuccess('Order marked as completed.');
            this.populateData();
          },
          error: (e) => this.messageService.showError(e)
        });
      }
    });
  }

  cancelOrder(order: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Cancel order #${order.id} from "${order.memberUsername}"? Stock will be restored.` }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.orderService.cancelOrder(order.id).subscribe({
          next: () => {
            this.messageService.showSuccess('Order cancelled and stock restored.');
            this.populateData();
          },
          error: (e) => this.messageService.showError(e)
        });
      }
    });
  }
}
