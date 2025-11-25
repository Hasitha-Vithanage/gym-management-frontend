import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Route, Router } from '@angular/router';
import { EmployeePrintServiceService } from 'src/app/services/employee-print-service/employee-print-service.service';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { SupplementOrdersService } from 'src/app/services/supplement-orders/supplement-orders.service';

export interface OrderFlatRow {
  orderedBy: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
}
@Component({
  selector: 'app-sales-and-requests',
  standalone: false,
  templateUrl: './sales-and-requests.component.html',
  styleUrl: './sales-and-requests.component.scss'
})
export class SalesAndRequestsComponent {
viewOrder(order: any) {
  
 this.router.navigate(['/pages/order-details', order.id]);
}

orderItemDisplayedColumns: string[] = ['orderedBy', 'productName', 'totalPrice', 'date', 'actions'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filteredEmployees: any[] = [];

  constructor(
    private employeeService: EmpolyeeServiceService,
    private supplementOrdersService: SupplementOrdersService,
    private messageService: MessageServiceService,
    private employeePrintServiceService: EmployeePrintServiceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.populateData();
  }

public orders: OrderFlatRow[] = [];

populateData(): void {
  this.supplementOrdersService.getOrderDetails().subscribe({
    next: (orders: any[]) => {
      
      this.orders = orders;
      console.log("Order Details: ",orders);
      
    },
    error: (err) => {
      console.error('Failed to fetch orders', err);
    }
  });
}


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.filteredEmployees = this.dataSource.filteredData;

    // pagination code
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public refreshData(): void {
    this.populateData();
  }
}
