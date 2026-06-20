import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { SupplementProductService } from 'src/app/services/new-supplement/new-supplement-service.service';

@Component({
  selector: 'app-supplement-details',
  standalone: false,
  templateUrl: './supplement-details.component.html',
  styleUrl: './supplement-details.component.scss'
})
export class SupplementDetailsComponent implements OnInit {
  supplement: any;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private supplementService: SupplementProductService,
    private router: Router,
    private messageService: MessageServiceService,
        private http: HttpService,
  ) {}

ngOnInit(): void { }


  addToCart(): void {
    console.log('Adding to cart:', this.supplement, 'Quantity:', this.quantity);
    if(this.quantity > this.supplement.quantityInStock) {
      console.error('Quantity must be greater than stock');
      this.messageService.showError("Quantity must be less than or equal to stock available");
      return;
    }
  }

checkout(supplement: any): void {
  console.log('Proceeding to checkout with:', supplement, 'Quantity:', this.quantity);
  this.router.navigate(
    ['/pages/supplement-details', supplement.id, 'checkout'],
    {
      state: {
        quantity: this.quantity
      }
    }
  );
}

  backToBrowsePage(): void {
    window.history.back();
  }
}
