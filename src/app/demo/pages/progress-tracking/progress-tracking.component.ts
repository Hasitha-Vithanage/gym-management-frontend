import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NewEquipmentServiceService } from 'src/app/services/new-equipment/new-equipment-service.service';
import { NewEquipmentDialogComponent } from '../new-equipment-dialog/new-equipment-dialog.component';
import { AddNewProgressDialogComponent } from '../add-new-progress-dialog/add-new-progress-dialog.component';



@Component({
  selector: 'app-progress-tracking',
  standalone: false,
  templateUrl: './progress-tracking.component.html',
  styleUrl: './progress-tracking.component.scss'
})
export class ProgressTrackingComponent {

   supplierList: any[] = [];  // List of suppliers
  
    constructor(
      private equipmentService: NewEquipmentServiceService,
      private newEquipmentService: NewEquipmentServiceService
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
      const dialogRef = this.dialog.open(AddNewProgressDialogComponent, {
        autoFocus: false,
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.action === 'add') {
          this.dataSource.data = [result.data, ...this.dataSource.data];
        }
      });
    }
  
    // Edit Data function
    editData(data: any): void {
      const dialogRef = this.dialog.open(NewEquipmentDialogComponent, {
        autoFocus: false,
      });
  
      dialogRef.afterOpened().subscribe(() => {
        dialogRef.componentInstance.onEdit(data);
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.action === 'edit') {
          const newData = this.dataSource.data.filter(item => item.id !== result.data.id);
          // Add the updated item to the top
          this.dataSource.data = [result.data, ...newData];
        }
      });
    }
  
    // Delete Data function
    deleteData(data: any): void {
      this.equipmentService.deleteEquipment(data.id).subscribe({
        next: () => {
          console.log('Equipment deleted successfully');
          this.refreshData();
        },
        error: (error) => {
          console.error('Failed to delete equipment:', error);
        }
      });
    }
}
