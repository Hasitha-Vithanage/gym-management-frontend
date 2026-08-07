import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { CommonDataServiceService } from 'src/app/services/common-data-service/common-data-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { PdfExportService } from 'src/app/services/pdf-export/pdf-export.service';

@Component({
  selector: 'app-monthly-sales',
  standalone: false,
  templateUrl: './monthly-sales.component.html',
  styleUrl: './monthly-sales.component.scss'
})
export class MonthlySalesComponent {
  @ViewChild('chart') chart: ChartComponent;
  @ViewChild('pdfContent') pdfContent: ElementRef;
  monthlySalesCountOptions: any = {};
  monthlySalesIncomeOptions: any = {};
  monthlySalesCountOptionsLight: any = {};
  monthlySalesIncomeOptionsLight: any = {};
  isDownloading = false;

  constructor(
    private commonDataService: CommonDataServiceService,
    private messageService: MessageServiceService,
    private pdfExportService: PdfExportService
  ) {
    this.getMonthlySalesCount();
    this.getMonthlySalesIncome();
  }

  async downloadReport(): Promise<void> {
    const element = this.pdfContent?.nativeElement;
    if (!element || this.isDownloading) return;

    this.isDownloading = true;
    try {
      await this.pdfExportService.downloadElementAsPdf(element, 'monthly-sales-report.pdf', '#ffffff');
      this.messageService.showSuccess('Report downloaded successfully!');
    } catch (error) {
      this.messageService.showError('Failed to generate report PDF');
      console.error(error);
    } finally {
      this.isDownloading = false;
    }
  }

  public getMonthlySalesCount(): void {
    this.commonDataService.getMonthlySalesCount().subscribe({
      next: (response: any) => {
        this.updateMonthlySalesCount(response);
      },
      error: (error: any) => {
        this.messageService.showError(error);
      }
    });
  }
  public getMonthlySalesIncome(): void {
    this.commonDataService.getMonthlySalesIncome().subscribe({
      next: (response: any) => {
        this.updateMonthlySalesIncome(response);
      },
      error: (error: any) => {
        this.messageService.showError(error);
      }
    });
  }

  public updateMonthlySalesCount(data: any): void {
    this.monthlySalesCountOptions = this.buildChartOptions(data, 'Supplement Sales Count', 'Supplement Sales count', false);
    this.monthlySalesCountOptionsLight = this.buildChartOptions(data, 'Supplement Sales Count', 'Supplement Sales count', true);
  }

  public updateMonthlySalesIncome(data: any): void {
    this.monthlySalesIncomeOptions = this.buildChartOptions(data, 'Supplement Sales Income', 'Supplement Sales Income', false);
    this.monthlySalesIncomeOptionsLight = this.buildChartOptions(data, 'Supplement Sales Income', 'Supplement Sales Income', true);
  }

  private buildChartOptions(data: any[], seriesName: string, titleText: string, light: boolean): any {
    const chartData = data.map((d: any) => ({ x: d.month, y: d.cnt }));

    const textColor  = light ? '#6b7280' : '#9BA3B8';
    const gridColor  = light ? '#e5e7eb' : 'rgba(255,255,255,0.06)';
    const titleColor = light ? '#1f2937' : '#E5E7EB';

    return {
      series: [{ name: seriesName, data: chartData }],
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
            colors: textColor
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
          borderRadius: 4,
          columnWidth: '60%'
        }
      },
      grid: {
        borderColor: gridColor
      },
      tooltip: {
        theme: light ? 'light' : 'dark'
      },
      title: {
        text: titleText,
        align: 'center',
        style: {
          color: titleColor,
          fontSize: '16px'
        }
      }
    };
  }
}
