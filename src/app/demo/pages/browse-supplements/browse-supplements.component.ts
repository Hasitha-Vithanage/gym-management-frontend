import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SupplementProductService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { SupplementCheckoutComponent } from '../supplement-checkout/supplement-checkout.component';

@Component({
  selector: 'app-browse-supplements',
  standalone: false,
  templateUrl: './browse-supplements.component.html',
  styleUrl: './browse-supplements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseSupplementsComponent implements OnInit {

  allProducts: any[] = [];
  filteredProducts: any[] = [];
  searchTerm = '';
  activeCategory = 'All';
  isLoading = false;

  categories = [
    'All', 'Protein', 'Creatine', 'Pre-Workout', 'Vitamins & Minerals',
    'BCAA', 'Weight Gainer', 'Fat Burner', 'Amino Acids',
    'Hydration & Electrolytes', 'Other'
  ];

  readonly dialog = inject(MatDialog);

  constructor(
    private supplementService: SupplementProductService,
    private messageService: MessageServiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.supplementService.getProductsForMembers().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.messageService.showError(e?.error?.message ?? 'Failed to load products.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.applyFilters();
    this.cdr.markForCheck();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
    this.cdr.markForCheck();
  }

  private applyFilters(): void {
    let result = [...this.allProducts];

    if (this.activeCategory !== 'All') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.productName?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    this.filteredProducts = result;
  }

  openOrderDialog(product: any): void {
    const dialogRef = this.dialog.open(SupplementCheckoutComponent, {
      autoFocus: false,
      data: { product }
    });
    dialogRef.afterClosed().subscribe((ordered) => {
      if (ordered) this.loadProducts();
    });
  }

  stockLabel(qty: number): string {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 5)  return 'Low Stock';
    return 'In Stock';
  }

  stockClass(qty: number): string {
    if (qty === 0) return 'out';
    if (qty <= 5)  return 'low';
    return 'ok';
  }
}
