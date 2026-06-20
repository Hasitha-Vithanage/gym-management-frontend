import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  isLoading = false;
  memberUsername = '';

  readonly dialog = inject(MatDialog);

  constructor(
    private orderService: SupplementOrderService,
    private messageService: MessageServiceService,
    private httpService: HttpService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.memberUsername = this.httpService.getLoginNameFromCache() ?? '';
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.memberUsername) return;
    this.isLoading = true;
    this.orderService.getOrdersByMember(this.memberUsername).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.messageService.showError(e?.error?.message ?? 'Failed to load orders.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
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
}
