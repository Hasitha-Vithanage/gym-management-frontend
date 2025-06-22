import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';

@Component({
  selector: 'app-supplement-checkout',
  standalone: false,
  templateUrl: './supplement-checkout.component.html',
  styleUrl: './supplement-checkout.component.scss'
})
export class SupplementCheckoutComponent {

  supplement: any;
  checkoutForm!: FormGroup;


  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private supplementService: NewSupplementServiceService,
    private router: Router,
    private http: HttpService,
  ) { }

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
      firstName: [this.http.getLoginNameFromCache(), Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      notes: ['']
    });

  }

  get shippingAddress(): string {
    const f = this.checkoutForm.value;
    return `${f.address}, ${f.district}, ${f.city}, ${f.country}`;
  }

  placeOrder(): void {
    if (this.checkoutForm.valid) {
      console.log('Order Placed:', this.checkoutForm.value);
    }
  }

  backButton(): void {
    window.history.back();
  }
}
