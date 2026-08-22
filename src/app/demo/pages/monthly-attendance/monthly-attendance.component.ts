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
  memberMonthlyAttendanceAvgChartOptions: any = {};
  memberMonthlyAttendanceAvgChartOptionsLight: any = {};
  isDownloading = false;

  constructor(
    private commonDataService: CommonDataServiceService,
    private messageService: MessageServiceService,
    private pdfExportService: PdfExportService
  ) {
    this.getMonthlyMemberPresentAttendance();
    // this.getMonthlyMemberPresentAttendanceAvg(); // backend endpoint is commented out, see CommonServiceController
  }

  async downloadReport(): Promise<void> {
    if (this.isDownloading) return;

    // Setting this mounts the *ngIf-gated hidden light clone. It's only ever
    // in the DOM for the duration of this method — kept off permanently, two
    // live ApexCharts instances of the "same" chart ended up cross-talking
    // (a tooltip on the dark chart would render with the light theme).
    this.isDownloading = true;
    try {
      // Give Angular a tick to mount the clone and ApexCharts a moment to
      // draw into it before we screenshot.
      await new Promise(resolve => setTimeout(resolve, 300));
      const element = this.pdfContent?.nativeElement;
      if (!element) return;

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
  
  public getMonthlyMemberPresentAttendanceAvg(): void {
    this.commonDataService.getMonthlyMemberAttendanceAvg().subscribe({
      next: (response: any) => {
        this.updateMonthlyPresentMemberAttendanceAvg(response);
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

  public updateMonthlyPresentMemberAttendanceAvg(data: any): void {
    this.memberMonthlyAttendanceAvgChartOptions = this.buildAvgChartOptions(data, false);
    this.memberMonthlyAttendanceAvgChartOptionsLight = this.buildAvgChartOptions(data, true);
  }

  private buildChartOptions(data: any[], light: boolean): any {
    const monthlyMemberAttendanceData = data.map((d: any) => ({
      x: d.month,
      y: d.present_days
    }));

    const textColor = light ? '#6b7280' : '#9BA3B8';
    const gridColor = light ? '#e5e7eb' : 'rgba(255,255,255,0.06)';
    const titleColor = light ? '#1f2937' : '#E5E7EB';

    return {
      series: [{ name: 'Present Member Count', data: monthlyMemberAttendanceData }],
      chart: {
        id: `member-monthly-attendance-${light ? 'light' : 'dark'}`,
        type: 'bar',
        height: 350,
        background: light ? '#ffffff' : 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        foreColor: textColor,
        toolbar: {
          show: false
        }
      },
      xaxis: {
        title: {
          text: 'Month',
          style: {
            color: textColor
          }
        },
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
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const label = w.globals.seriesX[seriesIndex][dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          const bg = light ? '#ffffff' : '#1f2937';
          const fg = light ? '#1f2937' : '#F0F2F8';
          const border = light ? '#e5e7eb' : '#374151';
          return `<div style="background:${bg};color:${fg};border:1px solid ${border};border-radius:6px;padding:8px 12px;font-size:12px;min-width:150px;">` +
                 `<div style="font-weight:600;margin-bottom:6px;">${label}</div>` +
                 `<div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:#FF6B00;display:inline-block;"></span>Present Member Count: <b>${value}</b></div>` +
                 `</div>`;
        }
      },
      title: {
        text: '',
        align: 'center',
        style: {
          color: titleColor,
          fontSize: '16px'
        }
      }
    };
  }
  
  private buildAvgChartOptions(data: any[], light: boolean): any {
    const monthlyMemberAttendanceData = data.map((d: any) => ({
      x: d.month,
      y: d.avg_present_per_day
    }));

    const textColor = light ? '#6b7280' : '#9BA3B8';
    const gridColor = light ? '#e5e7eb' : 'rgba(255,255,255,0.06)';
    const titleColor = light ? '#1f2937' : '#E5E7EB';

    return {
      series: [{ name: 'Present Member Count', data: monthlyMemberAttendanceData }],
      chart: {
        id: `member-monthly-attendance-avg-${light ? 'light' : 'dark'}`,
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
        title: {
          text: 'Month',
          style: {
            color: textColor
          }
        },
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
        text: '',
        align: 'center',
        style: {
          color: titleColor,
          fontSize: '16px'
        }
      }
    };
  }
}
