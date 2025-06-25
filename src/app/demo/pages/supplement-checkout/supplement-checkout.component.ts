import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-supplement-checkout',
  standalone: false,
  templateUrl: './supplement-checkout.component.html',
  styleUrl: './supplement-checkout.component.scss'
})
export class SupplementCheckoutComponent {

  supplement: any;
  quantity: number = 1;
  checkoutForm!: FormGroup;



  


  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private supplementService: NewSupplementServiceService,
    private router: Router,
    private http: HttpService,
    private messageService: MessageServiceService,
  ) {

    // Access quantity passed from product page
    const nav = this.router.getCurrentNavigation();
    this.quantity = nav?.extras?.state?.['quantity'] ?? 1;
    

  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.supplementService.getSupplementById(+id).subscribe((data: any) => {
        // Combine MIME type and base64 image string
        if (data.image && data.imageType) {
          data.imageSrc = `data:${data.imageType};base64,${data.image}`;
        }
        this.supplement = data;
      });
    }

    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      notes: [''],

    });

  }


  get shippingAddress(): string {
  const f = this.checkoutForm.value;
  return `${f.address}`;
}

  get totalCost(): string {
  return this.supplement ? (this.supplement.retailPrice * this.quantity).toFixed(2) : '0.00';
}

placeOrder(): void {

  const userName = this.http.getLoginNameFromCache();

const orderDto = {
  totalCost: this.supplement.retailPrice * this.quantity,
  orderedBy: userName, // You can get this from user session if needed
  orderItems: [
    {
      productId: this.supplement.id,
      quantity: this.quantity,
      productName: this.supplement.productName,
      unitPrice: this.supplement.retailPrice,
      totalPrice: this.supplement.retailPrice * this.quantity
    }
  ],
  billingDetails: {
    firstName: this.checkoutForm.value.firstName,
    lastName: this.checkoutForm.value.lastName,
    address: this.checkoutForm.value.address,
    phone: this.checkoutForm.value.phone,
    email: this.checkoutForm.value.email,
    note: this.checkoutForm.value.notes
  }
};


  if(this.checkoutForm.valid) {

  this.supplementService.placeOrder(orderDto).subscribe(
    (response) => {
      console.log('Order placed successfully:', response);
      // displaying success message
            this.messageService.showSuccess('Order Placed successfully!');
            window.history.back()
    },
    (error) => this.messageService.showError(error)
    
  );
}
}


backButton(): void {
  window.history.back();
}
}
