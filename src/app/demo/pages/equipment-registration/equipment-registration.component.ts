import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NewEquipmentDialogComponent } from '../new-equipment-dialog/new-equipment-dialog.component';
import { NewEquipmentServiceService } from 'src/app/services/new-equipment/new-equipment-service.service';

const ELEMENT_DATA: any[] = [
  { supplierName: 1, contactPerson: 'Hydrogen', contactNo: 1.0079, emailAddress: 'H', officeAddress: 1, postalAddress: 'Hydrogen', equipmentType: 1.0079, status: 'H', remarks: 1, actions: 1 },
];

@Component({
  selector: 'app-equipment-registration',
  standalone: false,
  templateUrl: './equipment-registration.component.html',
  styleUrl: './equipment-registration.component.scss'
})
export class EquipmentRegistrationComponent {

  constructor(
    private equipmentService: NewEquipmentServiceService
  ) { }

  // OnInit function
  ngOnInit(): void {
    this.populateData();
  }

  // Table function
  displayedColumns: string[] = ['supplierName', 'contactPerson', 'contactNo', 'emailAddress', 'officeAddress', 'postalAddress', 'equipmentType', 'status', 'remarks', 'actions'];
  dataSource = new MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //populateData function
  public populateData(): void {
    this.equipmentService.getData().subscribe((response: any) => {
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
  }

  // Open dialog Box function
  readonly dialog = inject(MatDialog);
  openDialog(): void {
    const dialogRef = this.dialog.open(NewEquipmentDialogComponent, {
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
        
      },
      error: (error) => {
        console.error('Failed to delete supplier:', error);
      }
    });
  }
}
