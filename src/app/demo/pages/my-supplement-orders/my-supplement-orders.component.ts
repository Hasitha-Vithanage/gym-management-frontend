import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SupplementOrderService } from 'src/app/services/supplement-orders/supplement-orders.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { HttpService } from 'src/app/services/http.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-supplement-orders',
  standalone: false,
  templateUrl: './my-supplement-orders.component.html',
  styleUrl: './my-supplement-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MySupplementOrdersComponent implements OnInit {

  orders: any[] = [];
  isLoading = true;
  memberUsername = '';

  totalSpend = 0;
  pendingCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  mostOrderedProduct = { name: '-', count: 0 };

  readonly dialog = inject(MatDialog);

  constructor(
    private orderService: SupplementOrderService,
    private messageService: MessageServiceService,
    private httpService: HttpService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.memberUsername = this.httpService.getLoginNameFromCache() ?? '';
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.memberUsername) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    this.isLoading = true;
    this.cdr.detectChanges();
    this.orderService.getOrdersByMember(this.memberUsername).subscribe({
      next: (data) => {
        this.orders = data.map(order => ({
          ...order,
          orderDate: Array.isArray(order.orderDate)
            ? new Date(order.orderDate[0], order.orderDate[1] - 1, order.orderDate[2],
                       order.orderDate[3], order.orderDate[4], order.orderDate[5])
            : order.orderDate
        }));
        this.computeStats();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.messageService.showError(e?.error?.message ?? 'Failed to load orders.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private computeStats(): void {
    this.totalSpend     = this.orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    this.pendingCount   = this.orders.filter(o => o.status === 'PENDING').length;
    this.completedCount = this.orders.filter(o => o.status === 'COMPLETED').length;
    this.cancelledCount = this.orders.filter(o => o.status === 'CANCELLED').length;

    const productMap = new Map<string, number>();
    for (const order of this.orders.filter(o => o.status !== 'CANCELLED')) {
      for (const item of (order.items ?? [])) {
        productMap.set(item.productName, (productMap.get(item.productName) ?? 0) + (item.quantity ?? 0));
      }
    }
    let maxQty = 0;
    let maxProduct = '-';
    productMap.forEach((qty, name) => { if (qty > maxQty) { maxQty = qty; maxProduct = name; } });
    this.mostOrderedProduct = { name: maxProduct, count: maxQty };
  }

  cancelOrder(order: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Cancel order #${order.id}? Stock will be restored.` }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.orderService.cancelOrder(order.id).subscribe({
          next: () => {
            this.messageService.showSuccess('Order cancelled successfully.');
            this.loadOrders();
          },
          error: (e) => this.messageService.showError(e?.error?.message ?? 'Cancel failed.')
        });
      }
    });
  }

  statusClass(status: string): string {
    if (status === 'PENDING')   return 'pending';
    if (status === 'COMPLETED') return 'completed';
    return 'cancelled';
  }

  browseSupplements(): void {
    this.router.navigate(['/pages/browse-supplements']);
  }
}
