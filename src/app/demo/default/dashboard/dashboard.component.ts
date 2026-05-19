import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { forkJoin, takeUntil } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MonthlyBarChartComponent } from './monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from './income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from './analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from './sales-report-chart/sales-report-chart.component';
import { IconService } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MatTableDataSource } from '@angular/material/table';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
}

interface AnalyticCard {
  title: string;
  countKey: keyof DashboardCounts;
  background: string;
  border: string;
  icon: 'rise' | 'fall';
  percentage: string;
  color: string;
  trend: string;
}

interface DashboardCounts {
  employeeCount: number | null;
  memberCount: number | null;
  supplierCount: number | null;
  newMembersInThisMonth: number | null;
}

interface Transaction {
  background: string;
  icon: string;
  title: string;
  time: string;
  amount: string;
  percentage: string;
}

interface SupplementProduct {
  productName: string;
  brand: string;
  category: string;
  unit: string;
  quantityPerUnit: number;
  quantityInStock: number;
  retailPrice: number;
}

const ROUTES = {
  ADD_CLASS: '/pages/add-class',
  MONTHLY_ATTENDANCE: '/pages/reports/monthly-attendance',
  MONTHLY_SALES: '/pages/reports/monthly-sales',
  EMPLOYEE: '/pages/employee',
  MEMBER: '/pages/member',
  ASSIGN_TRAINER: '/pages/assign-trainer'
} as const;

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
export class DefaultComponent implements OnInit, OnDestroy {

  counts: DashboardCounts = {
    employeeCount: null,
    memberCount: null,
    supplierCount: null,
    newMembersInThisMonth: null
  };

  isLoadingCounts = false;
  isLoadingSupplements = false;
  hasCountsError = false;

  supplementsDataSource = new MatTableDataSource<SupplementProduct>();

  readonly displayedColumns: string[] = [
    'productName',
    'brand',
    'category',
    'quantityPerUnit',
    'quantityInStock',
    'retailPrice'
  ];

    readonly menuItems: MenuItem[] = [
    {
      title: 'Schedule a Class',
      description: 'Schedule a class with full details',
      icon: '../../../../assets/images/icon/schedule-class-icon.png',
      route: ROUTES.ADD_CLASS
    },
    {
      title: 'Check Monthly Attendance',
      description: 'Monthly attendance of employees and members',
      icon: '../../../../assets/images/icon/monthly-attendance-report-icon.png',
      route: ROUTES.MONTHLY_ATTENDANCE
    },
    {
      title: 'Monthly Sales',
      description: 'Check no of sales and income monthly',
      icon: '../../../../assets/images/icon/sales-report-icon.png',
      route: ROUTES.MONTHLY_SALES
    },
    {
      title: 'Employee Register',
      description: 'Register the employee to the system',
      icon: '../../../../assets/images/icon/employee-light-icon.png',
      route: ROUTES.EMPLOYEE
    },
    {
      title: 'Member Register',
      description: 'Register member to the system',
      icon: '../../../../assets/images/icon/member-light-icon.png',
      route: ROUTES.MEMBER
    },
    {
      title: 'Assign Trainer',
      description: 'Assign a trainer to a member',
      icon: '../../../../assets/images/icon/assign-trainer-icon.png',
      route: ROUTES.ASSIGN_TRAINER
    }
  ];

  readonly analyticCards: AnalyticCard[] = [
    {
      title: 'Total Employees',
      countKey: 'employeeCount',
      background: 'bg-light-primary',
      border: 'border-primary',
      icon: 'rise',
      percentage: '59.3%',
      color: 'text-primary',
      trend: '35,000'
    },
    {
      title: 'Total Members',
      countKey: 'memberCount',
      background: 'bg-light-primary',
      border: 'border-primary',
      icon: 'rise',
      percentage: '70.5%',
      color: 'text-primary',
      trend: '8,900'
    },
    {
      title: 'New Members This Month',
      countKey: 'newMembersInThisMonth',
      background: 'bg-light-warning',
      border: 'border-warning',
      icon: 'rise',
      percentage: '12.0%',
      color: 'text-warning',
      trend: '+new'
    },
    {
      title: 'Total Suppliers',
      countKey: 'supplierCount',
      background: 'bg-light-warning',
      border: 'border-warning',
      icon: 'fall',
      percentage: '27.4%',
      color: 'text-warning',
      trend: '1,943'
    }
  ];

    readonly transactions: Transaction[] = [
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

  private readonly destroy$ = new Subject<void>();


  // constructor
  constructor(
    private readonly iconService: IconService,
    private readonly dashboardService: DashboardService,
    private readonly supplementService: NewSupplementServiceService,
    private readonly router: Router
  ) {
    this.iconService.addIcon(
      RiseOutline,
      FallOutline,
      SettingOutline,
      GiftOutline,
      MessageOutline
    );
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadSupplements();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoadingCounts = true;
    this.hasCountsError = false;
 
    forkJoin({
      employeeCount: this.dashboardService.totalEmployeeCount(),
      memberCount: this.dashboardService.totalMemberCount(),
      supplierCount: this.dashboardService.totalSupplierCount(),
      newMembersInThisMonth: this.dashboardService.newMembersInThisMonth()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.counts = results;
          this.isLoadingCounts = false;
        },
        error: (err) => {
          console.error('[Dashboard] Failed to load counts:', err);
          this.hasCountsError = true;
          this.isLoadingCounts = false;
        }
      });
  }

  private loadSupplements(): void {
    this.isLoadingSupplements = true;
 
    this.supplementService
      .getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: SupplementProduct[]) => {
          this.supplementsDataSource.data = products;
          this.isLoadingSupplements = false;
        },
        error: (err) => {
          console.error('[Dashboard] Failed to load supplements:', err);
          this.isLoadingSupplements = false;
        }
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
