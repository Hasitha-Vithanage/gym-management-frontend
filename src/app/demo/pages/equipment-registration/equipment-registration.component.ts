import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NewEquipmentDialogComponent } from '../new-equipment-dialog/new-equipment-dialog.component';
import { NewEquipmentServiceService } from 'src/app/services/new-equipment/new-equipment-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

const ELEMENT_DATA: any[] = [
  {
    category: 1,
    supplier: 'Hydrogen',
    brandName: 1,
    quantity: 2,
    condition: 3,
    purchaseDate: '2023-10-01',
    addedBy: 'John Doe',
    machineName: 1.0079,
    muscleGroups: 'H',
    model: 'Hydrogen',
    type: 1.0079,
    sizeStandard: 'H',
    barLength: 1,
    weight: 1,
    equipmentName: 1,
    remarks: 'No remarks',
    actions: 2
  },
];

@Component({
  selector: 'app-equipment-registration',
  standalone: false,
  templateUrl: './equipment-registration.component.html',
  styleUrl: './equipment-registration.component.scss'
})
export class EquipmentRegistrationComponent {

  supplierList: any[] = [];  // List of suppliers

  constructor(
    private equipmentService: NewEquipmentServiceService,
    private newEquipmentService: NewEquipmentServiceService,
    private messageService: MessageServiceService
  ) { }

  // OnInit function
  ngOnInit(): void {
    this.populateData();
  }

  // Function to get supplier name by ID
  getSupplierName(id: number): string {
    const supplier = this.supplierList.find(s => s.id === id);
    return supplier ? supplier.supplierName : 'Unknown Supplier';
  }

  // getSupplier function
  public getSuppliers(): void {
    //Call Service to get suppliers
    this.newEquipmentService.getSuppliers().subscribe({
      next: (response: any[]) => {
        console.log("Suppliers: ", response);
        this.supplierList = response;
      },
      error: (error) => {
        console.log('Error fetching suppliers:', error);
      }
    });
  }

  // Table function
  displayedColumns: string[] = [
    'category',
    'supplier',
    'brandName',
    'quantity',
    'condition',
    'purchaseDate',
    'addedBy',
    'machineName',
    'muscleGroups',
    'model',
    'type',
    'sizeStandard',
    'barLength',
    'weight',
    'equipmentName',
    'remarks',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //populateData function
  public populateData(): void {
    this.equipmentService.getData().subscribe((response: any) => {
      this.getSuppliers(); // Call the function to get suppliers
      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      console.log("Get Data Response: ", response);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /* table filter function */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /* Refresh button function */
  refreshData(): void {
    this.populateData();
    this.getSuppliers(); // Call getSuppliers to populate the supplier list
  }
  // Open dialog Box function
  readonly dialog = inject(MatDialog);
  openDialog(): void {
    const dialogRef = this.dialog.open(NewEquipmentDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  // Edit Data function
  editData(data: any): void {
    const dialogRef = this.dialog.open(NewEquipmentDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

      public deleteData(data: any): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          message: `Are you sure you want to delete ${data.category}?`
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const id = data.id;
          this.newEquipmentService.deleteEquipment(id).subscribe({
            next: () => {
              const index = this.dataSource.data.findIndex(item => item.id === id);
              if (index !== -1) {
                this.dataSource.data.splice(index, 1);
              }
              this.dataSource = new MatTableDataSource(this.dataSource.data);
              this.messageService.showSuccess('Record deleted successfully!');
            },
            error: (error) => {
              this.messageService.showError(error);
            }
          });
        }
      });
    }

}
