import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewSupplementDialogComponent } from '../new-supplement-dialog/new-supplement-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MatPaginator } from '@angular/material/paginator';

const ELEMENT_DATA: any[] = [
  {
    productName: 1,
    brand: 'Hydrogen',
    category: 1,
    quantityPerUnit: 2,
    // unit: 3,
    costPrice: '2023-10-01',
    retailPrice: 'John Doe',
    quantityInStock: 1.0079,
    expiryDate: 'H',
    supplier: 'Hydrogen',
    description: 1.0079,
    image: 1.0079,
    imageName: 1.0079,
    imageType: 1.0079,
    // sizeStandard: 'H',
    // barLength: 1,
    // weight: 1,
    // equipmentName: 1,
    // remarks: 'No remarks',
    actions: 2
  },
];

@Component({
  selector: 'app-supplement-inventory-management',
  standalone: false,
  templateUrl: './supplement-inventory-management.component.html',
  styleUrl: './supplement-inventory-management.component.scss'
})
export class SupplementInventoryManagementComponent {
    // Table function
  displayedColumns: string[] = [
    'productName',
    'brand',
    'category',
    'quantityPerUnit',
    // 'unit',
    'costPrice',
    'retailPrice',
    'quantityInStock',
    'expiryDate',
    'supplier',
    'description',
    'image',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private newSupplementService: NewSupplementServiceService,
    private dialogBox: MatDialog
  ) { }

   // OnInit function
  ngOnInit(): void {
    this.populateData();
  }

  /* Refresh table function */
  refreshData(): void {
    this.populateData();
  }

  //populateData function
  public populateData(): void {
    this.newSupplementService.getData().subscribe((response: any) => {
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

  // Dialog Box
  readonly dialog = inject(MatDialog);
  openDialog(): void {
    const dialogRef = this.dialog.open(NewSupplementDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
      }
    });
  }


  // Delete Data function
  deleteData(data: any): void {
    this.newSupplementService.deleteData(data.id).subscribe({
      next: () => {
        console.log('Supplement deleted successfully');
        this.refreshData();
      },
      error: (error) => {
        console.error('Failed to delete supplement:', error);
      }
    });
  }

  
  // Edit Data function
  editData(data: any): void {
    const dialogRef = this.dialog.open(NewSupplementDialogComponent, {
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




}
