import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NewSupplierDialogComponent } from '../new-supplier-dialog/new-supplier-dialog.component';
import { NewSupplierServiceService } from 'src/app/services/new-supplier/new-supplier-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

const ELEMENT_DATA: any[] = [
  { supplierName: 1, contactPerson: 'Hydrogen', contactNo: 1.0079, emailAddress: 'H', officeAddress: 1, postalAddress: 'Hydrogen', equipmentType: 1.0079, status: 'H', remarks: 1, actions: 1 },
];

@Component({
  selector: 'app-supplier-registration',
  standalone: false,
  templateUrl: './supplier-registration.component.html',
  styleUrl: './supplier-registration.component.scss'
})
export class SupplierRegistrationComponent implements OnInit {

  // constructor(private supplierService: NewSupplierServiceService) {

  // }

  constructor(
    private supplierService: NewSupplierServiceService,
    private dialogBox: MatDialog,
    private messageService: MessageServiceService
  ) { }

  // OnInit function
  ngOnInit(): void {
    this.populateData();
  }
  //equiment eka oya hadanna


  // Table function
  displayedColumns: string[] = ['supplierName', 'contactPerson', 'contactNo', 'emailAddress', 'officeAddress', 'postalAddress', 'equipmentType', 'status', 'remarks', 'actions'];
  dataSource = new MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //populateData function
  public populateData(): void {
    this.supplierService.getData().subscribe((response: any) => {
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

  /* Refresh table function */
  refreshData(): void {
    this.populateData();
  }

  // Dialog Box
  readonly dialog = inject(MatDialog);
  openDialog(): void {
    const dialogRef = this.dialog.open(NewSupplierDialogComponent, {
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
    const dialogRef = this.dialog.open(NewSupplierDialogComponent, {
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

    public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${data.supplierName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.supplierService.deleteSupplier(id).subscribe({
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
