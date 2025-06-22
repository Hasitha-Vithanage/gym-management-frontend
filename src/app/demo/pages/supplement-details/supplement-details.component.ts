import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';

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
    private supplementService: NewSupplementServiceService,
    private router: Router
  ) {}

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
}


  addToCart(): void {
    console.log('Adding to cart:', this.supplement, 'Quantity:', this.quantity);

  }

  checkout(supplement: any): void {
    console.log('Proceeding to checkout with:', this.supplement, 'Quantity:', this.quantity);
    this.router.navigate(['/pages/supplement-details', supplement.id, 'checkout']);
  }

  backToBrowsePage(): void {
    window.history.back();
  }
}
