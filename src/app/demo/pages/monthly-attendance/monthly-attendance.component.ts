import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { CommonDataServiceService } from 'src/app/services/common-data-service/common-data-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { PdfExportService } from 'src/app/services/pdf-export/pdf-export.service';

@Component({
  selector: 'app-monthly-attendance',
  standalone: false,
  templateUrl: './monthly-attendance.component.html',
  styleUrl: './monthly-attendance.component.scss'
})
export class MonthlyAttendanceComponent {
  @ViewChild('chart') chart: ChartComponent;
  @ViewChild('pdfContent') pdfContent: ElementRef;
  memberMonthlyAttendanceChartOptions: any = {};
  memberMonthlyAttendanceChartOptionsLight: any = {};
  isDownloading = false;

  constructor(
    private commonDataService: CommonDataServiceService,
    private messageService: MessageServiceService,
    private pdfExportService: PdfExportService
  ) {
    this.getMonthlyMemberPresentAttendance();
  }

  async downloadReport(): Promise<void> {
    const element = this.pdfContent?.nativeElement;
    if (!element || this.isDownloading) return;

    this.isDownloading = true;
    try {
      await this.pdfExportService.downloadElementAsPdf(element, 'monthly-attendance-report.pdf', '#ffffff');
      this.messageService.showSuccess('Report downloaded successfully!');
    } catch (error) {
      this.messageService.showError('Failed to generate report PDF');
      console.error(error);
    } finally {
      this.isDownloading = false;
    }
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
    this.memberMonthlyAttendanceChartOptions = this.buildChartOptions(data, false);
    this.memberMonthlyAttendanceChartOptionsLight = this.buildChartOptions(data, true);
  }

  private buildChartOptions(data: any[], light: boolean): any {
    const monthlyMemberAttendanceData = data.map((d: any) => ({
      x: d.month,
      y: d.present_days
    }));

    const textColor  = light ? '#6b7280' : '#9BA3B8';
    const gridColor  = light ? '#e5e7eb' : 'rgba(255,255,255,0.06)';
    const titleColor = light ? '#1f2937' : '#E5E7EB';

    return {
      series: [{ name: 'Present Member Count', data: monthlyMemberAttendanceData }],
      chart: {
        type: 'bar',
        height: 350,
        background: light ? '#ffffff' : 'transparent',
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
            colors: textColor,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Count',
          style: {
            color: textColor
          }
        },
        labels: {
          style: {
            colors: textColor
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
        borderColor: gridColor
      },
      tooltip: {
        theme: light ? 'light' : 'dark'
      },
      title: {
        text: 'Present member count',
        align: 'center',
        style: {
          color: titleColor,
          fontSize: '16px'
        }
      }
    };
  }

}
