import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupplementOrderService } from 'src/app/services/supplement-orders/supplement-orders.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-supplement-checkout',
  standalone: false,
  templateUrl: './supplement-checkout.component.html',
  styleUrl: './supplement-checkout.component.scss'
})
export class SupplementCheckoutComponent implements OnInit {

  product: any;
  quantity = 1;
  notes = '';
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<SupplementCheckoutComponent>,
    private orderService: SupplementOrderService,
    private messageService: MessageServiceService,
    private httpService: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.product = this.data?.product;
  }

  get total(): number {
    return (this.product?.price ?? 0) * this.quantity;
  }

  increment(): void {
    if (this.quantity < (this.product?.stockQty ?? 1)) this.quantity++;
  }

  decrement(): void {
    if (this.quantity > 1) this.quantity--;
  }

  placeOrder(): void {
    if (!this.product || this.quantity < 1) return;

    const memberUsername = this.httpService.getLoginNameFromCache();
    if (!memberUsername) {
      this.messageService.showError('Unable to identify user. Please log in again.');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      memberUsername,
      notes: this.notes.trim() || null,
      items: [{ productId: this.product.id, quantity: this.quantity }]
    };

    this.orderService.placeOrder(payload).subscribe({
      next: () => {
        this.messageService.showSuccess('Order placed successfully! Pick up at the gym counter.');
        this.dialogRef.close(true);
      },
      error: (e) => {
        this.messageService.showError(e?.error?.message ?? e?.message ?? 'Failed to place order.');
        this.isSubmitting = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
