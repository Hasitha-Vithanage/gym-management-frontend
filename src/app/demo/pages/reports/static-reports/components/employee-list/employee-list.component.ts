import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, MinLengthValidator, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeePrintServiceService } from 'src/app/services/employee-print-service/employee-print-service.service';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = [
    'employeeId',
    'jobTitle',
    'dateOfJoining',
    'firstName',
    'lastName',
    'nic',
    'dateOfBirth',
    'gender',
    'address',
    'email',
    'phoneNumber',
    'emergencyContactNumber',
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
 
    ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  filteredEmployees: any[] = [];

  constructor(
    private employeeService: EmpolyeeServiceService,
    private messageService: MessageServiceService,
    private employeePrintServiceService: EmployeePrintServiceService
  ) {}

  ngOnInit(): void {
    this.populateData();
  }

  public populateData(): void {
    try {
      this.employeeService.getData().subscribe({
        next: (dataList: any[]) => {
          if (dataList.length <= 0) {
            return;
          }

          this.filteredEmployees = dataList;
          this.dataSource = new MatTableDataSource(dataList);

          // sorting and pagination
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        // displaying error message
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    } catch (error) {
      this.messageService.showError(error);
    }
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

  printReport(): void {
    this.employeePrintServiceService.printEmployeeReport(this.filteredEmployees);
  }
}
