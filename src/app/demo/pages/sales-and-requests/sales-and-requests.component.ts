import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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
viewId(_t84: any) {
throw new Error('Method not implemented.');
}
deleteData(_t84: any) {
throw new Error('Method not implemented.');
}
editData(_t84: any) {
throw new Error('Method not implemented.');
}

orderItemDisplayedColumns: string[] = ['orderedBy', 'productName', 'quantity', 'totalPrice', 'date'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filteredEmployees: any[] = [];

  constructor(
    private employeeService: EmpolyeeServiceService,
    private supplementOrdersService: SupplementOrdersService,
    private messageService: MessageServiceService,
    private employeePrintServiceService: EmployeePrintServiceService
  ) { }

  ngOnInit(): void {
    this.populateData();
  }

public orderItemsFlattened: OrderFlatRow[] = [];

populateData(): void {
  this.supplementOrdersService.getOrderDetails().subscribe({
    next: (orders: any[]) => {
      this.orderItemsFlattened = [];

      orders.forEach(order => {
        if (order.orderItems && order.orderItems.length > 0) {
          order.orderItems.forEach(item => {
            this.orderItemsFlattened.push({
              orderedBy: order.orderedBy,
              productName: item.productName,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              date: order.date
            });
          });
        }
      });
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
