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
  memberMonthlyAttendanceChartOptions: any = {};

  constructor(
    private commonDataService: CommonDataServiceService,
    private messageService: MessageServiceService
  ) {
    this.getMonthlyMemberPresentAttendance();
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
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        toolbar: {
          show: false
        }
      },
      xaxis: {
        labels: {
          style: {
            colors: '#9BA3B8',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Count',
          style: {
            color: '#9BA3B8'
          }
        },
        labels: {
          style: {
            colors: '#9BA3B8'
          }
        }
      },
      colors: ['#FF6B00'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '55%'
        }
      },
      grid: {
        borderColor: 'rgba(255,255,255,0.06)'
      },
      tooltip: {
        theme: 'dark'
      },
      title: {
        text: 'Present member count',
        align: 'center',
        style: {
          color: '#E5E7EB',
          fontSize: '16px'
        }
      }
    };
  }

}
