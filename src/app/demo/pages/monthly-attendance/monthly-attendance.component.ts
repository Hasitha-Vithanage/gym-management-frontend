import { Component, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { CommonDataServiceService } from 'src/app/services/common-data-service/common-data-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-monthly-attendance',
  standalone: false,
  templateUrl: './monthly-attendance.component.html',
  styleUrl: './monthly-attendance.component.scss'
})
export class MonthlyAttendanceComponent {
  @ViewChild('chart') chart: ChartComponent;
  employeeMonthlyAttendanceChartOptions: any = {};
  memberMonthlyAttendanceChartOptions: any = {};

  constructor(
    private commonDataService: CommonDataServiceService,
    private messageService: MessageServiceService
  ) {
    this.getMonthlyEmployeePresentAttendance();
    this.getMonthlyMemberPresentAttendance();
  }

  public getMonthlyEmployeePresentAttendance(): void {
    this.commonDataService.getMonthlyEmployeeAttendance().subscribe({
      next: (response: any) => {
        this.updateMonthlyPresentEmployeeAttendance(response);
      },
      error: (error: any) => {
        this.messageService.showError(error);
      }
    });
  }
  public getMonthlyMemberPresentAttendance(): void {
    this.commonDataService.getMonthlyMemberAttendance().subscribe({
      next: (response: any) => {
        this.updateMonthlyPresentMemberAttendance(response);
      },
      error: (error: any) => {
        this.messageService.showError(error);
      }
    });
  }

  public updateMonthlyPresentEmployeeAttendance(data: any): void {
    const monthlyEmployeeAttendanceData = data.map((data: any) => {
      return {
        x: data.month,
        y: data.present_days
      };
    });

    this.employeeMonthlyAttendanceChartOptions = {
      series: [{ name: 'Present Employee Count', data: monthlyEmployeeAttendanceData }],
      chart: {
        type: 'bar',
        height: 350,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      xaxis: {
        labels: {
          style: {
            colors: '#6b7280'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Count',
          style: {
            color: '#6b7280'
          }
        },
        labels: {
          style: {
            colors: '#6b7280'
          }
        }
      },
      colors: ['#f97316'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%'
        }
      },
      grid: {
        borderColor: '#e5e7eb'
      },
      title: {
        text: 'Present employee count',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }

  public updateMonthlyPresentMemberAttendance(data: any): void {
    const monthlyMemberAttendanceData = data.map((data: any) => {
      return {
        x: data.month,
        y: data.present_days
      };
    });

    this.memberMonthlyAttendanceChartOptions = {
      series: [{ name: 'Present Member Count', data: monthlyMemberAttendanceData }],
      chart: {
        type: 'bar',
        height: 350,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      xaxis: {
        labels: {
          style: {
            colors: '#6b7280'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Count',
          style: {
            color: '#6b7280'
          }
        },
        labels: {
          style: {
            colors: '#6b7280'
          }
        }
      },
      colors: ['#f97316'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%'
        }
      },
      grid: {
        borderColor: '#e5e7eb'
      },
      title: {
        text: 'Present member count',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }

}
