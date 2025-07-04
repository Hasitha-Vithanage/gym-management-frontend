import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { PrintService } from 'src/app/services/print-service/print.service';

@Component({
  selector: 'app-member-list',
  standalone: false,
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent implements OnInit{
displayedColumns: string[] = [
    'employeeId',
    // 'jobTitle',
    // 'dateOfJoining',
    'firstName',
    'lastName',
    'nic',
    'dateOfBirth',
    'gender',
    'address',
    'email',
    'phoneNumber',
    'emergencyContactNumber'
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filteredMembers: any[] = [];

  constructor(
    private memberService: MemberServiceService,
    private messageService: MessageServiceService,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    this.populateData();
  }

  public populateData(): void {
    try {
      this.memberService.getData().subscribe({
        next: (dataList: any[]) => {
          if (dataList.length <= 0) {
            return;
          }

          this.filteredMembers = dataList;
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

    this.filteredMembers = this.dataSource.filteredData;

    // pagination code
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public refreshData(): void {
    this.populateData();
  }

  printReport(): void {
    this.printService.printEmployeeReport(this.filteredMembers);
  }
}
