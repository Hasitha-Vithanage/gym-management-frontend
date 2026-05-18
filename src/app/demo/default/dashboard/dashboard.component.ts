import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import tableData from 'src/fake-data/default-data.json';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MonthlyBarChartComponent } from './monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from './income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from './analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from './sales-report-chart/sales-report-chart.component';
import { IconService } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { forkJoin } from 'rxjs';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-default',
  imports: [
    CommonModule,
    SharedModule,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent,
    AnalyticsChartComponent,
    SalesReportChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DefaultComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      title: 'Schedule a Class',
      description: 'Schedule a class with full details',
      icon: '🏛️',
      route: '/pages/add-class'
    },
    {
      title: 'Check Monthly Attendance',
      description: 'Monthly attendance of employees and members',
      icon: '🙌',
      route: '/pages/reports/monthly-attendance'
    },
    {
      title: 'Monthly Sales',
      description: 'Check no of sales and Income monthly',
      icon: '💲💸',
      route: '/pages/reports/monthly-sales'
    },
    {
      title: 'Employee Register',
      description: 'Register the Employee to the System',
      icon: '🤠',
      route: '/pages/employee'
    },
    {
      title: 'Member Register',
      description: 'Register Member to the System',
      icon: '⛹️',
      route: '/pages/member'
    },
    {
      title: 'Assign Trainer',
      description: 'Assign a trainer to a member',
      icon: '💪🦵',
      route: '/pages/assign-trainer'
    }
  ];

  employeeCount;
  supplierCount;
  memberCount;
  newMembersInThisMonth;

  dataSource = new MatTableDataSource<any>();

  displayedColumns: string[] = ['productName', 'brand', 'category', 'quantityPerUnit', 'quantityInStock', 'retailPrice'];

  // constructor
  constructor(
    private iconService: IconService,
    private dashboardService: DashboardService,
    private newSupplementService: NewSupplementServiceService,
    private router: Router
  ) {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }
  ngOnInit(): void {
    this.populateDate();
  }

  populateDate() {
    forkJoin({
      employees: this.dashboardService.totalEmployeeCount(),
      members: this.dashboardService.totalMemberCount(),
      suppliers: this.dashboardService.totalSupplierCount(),
      newMembersInThisMonth: this.dashboardService.newMembersInThisMonth()
    }).subscribe({
      next: (results) => {
        this.employeeCount = results.employees;
        this.memberCount = results.members;
        this.supplierCount = results.suppliers;
        this.newMembersInThisMonth = results.newMembersInThisMonth;

        console.log('Employee Count:', this.employeeCount);
        console.log('Member Count:', this.memberCount);
        console.log('Supplier Count:', this.supplierCount);
      },
      error: (error) => {
        console.log('Error loading dashboard data:', error);
      }
    });

    this.newSupplementService.getData().subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource(response);
      }
    });
  }

  recentOrder = tableData;

  AnalyticEcommerce = [
    {
      title: 'Total Employees',
      amount: '4,42,236',
      background: 'bg-light-primary ',
      border: 'border-primary',
      icon: 'rise',
      percentage: '59.3%',
      color: 'text-primary',
      number: '35,000'
    },
    {
      title: 'Total Members',
      amount: '78,250',
      background: 'bg-light-primary ',
      border: 'border-primary',
      icon: 'rise',
      percentage: '70.5%',
      color: 'text-primary',
      number: '8,900'
    },
    {
      title: 'Total Order',
      amount: '18,800',
      background: 'bg-light-warning ',
      border: 'border-warning',
      icon: 'fall',
      percentage: '27.4%',
      color: 'text-warning',
      number: '1,943'
    },
    {
      title: 'Total Sales',
      amount: '$35,078',
      background: 'bg-light-warning ',
      border: 'border-warning',
      icon: 'fall',
      percentage: '27.4%',
      color: 'text-warning',
      number: '$20,395'
    }
  ];

  transaction = [
    {
      background: 'text-success bg-light-success',
      icon: 'gift',
      title: 'Order #002434',
      time: 'Today, 2:00 AM',
      amount: '+ $1,430',
      percentage: '78%'
    },
    {
      background: 'text-primary bg-light-primary',
      icon: 'message',
      title: 'Order #984947',
      time: '5 August, 1:45 PM',
      amount: '- $302',
      percentage: '8%'
    },
    {
      background: 'text-danger bg-light-danger',
      icon: 'setting',
      title: 'Order #988784',
      time: '7 hours ago',
      amount: '- $682',
      percentage: '16%'
    }
  ];

  navigateToSection(route: string) {
    this.router.navigate([route]);
  }
}
