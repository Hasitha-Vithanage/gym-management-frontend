import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { SupplementOrdersService } from 'src/app/services/supplement-orders/supplement-orders.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-order-details',
  standalone: false,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
  order: any;
  displayedColumns: string[] = ['name', 'qty', 'price', 'subtotal'];
  orderItem: any;
  billingDetails: any;

  constructor(
    private supplementOrdersService: SupplementOrdersService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageServiceService,
  ) { }

  ngOnInit(): void {

    this.populateData();

    // This would come from route or service
    // this.order = {
    //   orderId: 'ORD-2025071901',
    //   date: new Date(),
    //   status: 'Paid',
    //   total: 6500,
    //   billing: {
    //     name: 'Hasitha Vithanage',
    //     email: 'hasitha@example.com',
    //     phone: '0771234567',
    //     address: '123 Temple Road, Colombo',
    //   },
    //   shipping: {
    //     name: 'Hasitha Vithanage',
    //     address: '123 Temple Road',
    //     city: 'Colombo',
    //     postalCode: '10000'
    //   },
    //   items: [
    //     { name: 'Whey Protein 1kg', quantity: 1, price: 3500 },
    //     { name: 'Creatine 300g', quantity: 1, price: 3000 }
    //   ]
    // };
  }

  populateData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.supplementOrdersService.getOrderItemById(+id).subscribe((data: any) => {
        // Combine MIME type and base64 image string
        if (data.image && data.imageType) {
          data.imageSrc = `data:${data.imageType};base64,${data.image}`;
        }
        this.orderItem = data;
        console.log("Order Items: ", this.orderItem);
      });
    }

    this.supplementOrdersService.getOrderDetailsById(+id).subscribe({
      next: (response) => {
        this.order = response;
        console.log("Order Details: ", this.order);

      }
    });

    this.supplementOrdersService.getBillingDetails(+id).subscribe({
      next: (response) => {
        this.billingDetails = response;
      }
    })
  }

  backButton(): void {
    window.history.back();
  }

  readonly dialog = inject(MatDialog);
  markAsPaid(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want mark this Order as paid?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.supplementOrdersService.markAsPaid(id).subscribe({
          next: (response) => {

            this.messageService.showSuccess('Order marked as paid successfully!');
            this.backButton();
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
    });
  }
}
