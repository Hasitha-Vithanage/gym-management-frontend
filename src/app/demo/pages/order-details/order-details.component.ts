import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { log } from 'console';
import { SupplementOrdersService } from 'src/app/services/supplement-orders/supplement-orders.service';

@Component({
  selector: 'app-order-details',
  standalone: false,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
order: any;
  displayedColumns: string[] = ['name', 'qty', 'price', 'subtotal'];

    constructor(
      private supplementOrdersService: SupplementOrdersService,
      private router: Router
    ) { }

  ngOnInit(): void {

    this.populateData();

    // This would come from route or service
    this.order = {
      orderId: 'ORD-2025071901',
      date: new Date(),
      status: 'Paid',
      total: 6500,
      billing: {
        name: 'Hasitha Vithanage',
        email: 'hasitha@example.com',
        phone: '0771234567',
        address: '123 Temple Road, Colombo',
      },
      shipping: {
        name: 'Hasitha Vithanage',
        address: '123 Temple Road',
        city: 'Colombo',
        postalCode: '10000'
      },
      items: [
        { name: 'Whey Protein 1kg', quantity: 1, price: 3500 },
        { name: 'Creatine 300g', quantity: 1, price: 3000 }
      ]
    };
  }

  populateData() {
    this.supplementOrdersService.getOrdersOverLimit().subscribe({
      next: (response) => {
        console.log("Orders over 6000: ", response);
        
      }
    })
  }
}
