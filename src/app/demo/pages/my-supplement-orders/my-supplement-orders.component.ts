import { Component } from '@angular/core';

@Component({
  selector: 'app-my-supplement-orders',
  standalone: false,
  templateUrl: './my-supplement-orders.component.html',
  styleUrl: './my-supplement-orders.component.scss'
})
export class MySupplementOrdersComponent {

displayedColumns: string[] = ['image', 'product', 'quantity', 'price'];


orders = [
  {
    orderNumber: 'INV-1001',
    orderDate: new Date('2025-06-15'),
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    totalAmount: 8500,
    items: [
      {
        productName: 'Whey Protein - 1kg',
        quantity: 1,
        price: 4500,
        image: 'assets/images/supplements/Myprotein-Creatine-250g.jpg'
      },
      {
        productName: 'Creatine Monohydrate - 300g',
        quantity: 1,
        price: 4000,
        image: 'assets/images/supplements/Myprotein-Creatine-250g.jpg'
      }
    ]
  }
];


  recommendedItems = [
    { name: 'BCAA Powder - 300g', price: 3500, image: 'assets/images/supplements/Myprotein-Creatine-250g.jpg' },
    { name: 'Shaker Bottle', price: 800, image: 'assets/images/supplements/Kevin-Levrone-Gold-Creatine-300g-NEW2.jpg' },
    { name: 'Pre Workout - 200g', price: 2900, image: 'assets/images/supplements/Muscletech-Platinum-Creatine.jpg' }
  ];

  getTotalSpent(): number {
    return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  viewInvoice(order: any) {
    alert(`Viewing invoice for Order #${order.orderNumber}`);
  }

  downloadInvoice(order: any) {
    alert(`Downloading PDF for Order #${order.orderNumber}`);
  }

  reorder(order: any) {
    alert(`Reordering items from Order #${order.orderNumber}`);
  }

  browseStore() {
    alert('Redirecting to store...');
  }
}
