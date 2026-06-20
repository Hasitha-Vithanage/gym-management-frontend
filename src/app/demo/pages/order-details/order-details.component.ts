import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplementOrderService } from 'src/app/services/supplement-orders/supplement-orders.service';
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
    private supplementOrderService: SupplementOrderService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageServiceService,
  ) { }

  ngOnInit(): void { }

  backButton(): void {
    window.history.back();
  }
}
