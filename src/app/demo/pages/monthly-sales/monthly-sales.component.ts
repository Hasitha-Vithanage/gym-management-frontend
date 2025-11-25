import { Component, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { CommonDataServiceService } from 'src/app/services/common-data-service/common-data-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-monthly-sales',
  standalone: false,
  templateUrl: './monthly-sales.component.html',
  styleUrl: './monthly-sales.component.scss'
})
export class MonthlySalesComponent {
  @ViewChild('chart') chart: ChartComponent;
  monthlySalesCountOptions: any = {};
  monthlySalesIncomeOptions: any = {};

  constructor(
    private commonDataService: CommonDataServiceService,
    private messageService: MessageServiceService
  ) {
    this.getMonthlySalesCount();
    this.getMonthlySalesIncome();
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
    const monthlySuppliementDataCount = data.map((data: any) => {
      return {
        x: data.month,
        y: data.cnt
      };
    });

    this.monthlySalesCountOptions = {
      series: [{ name: 'Supplement Sales Count', data: monthlySuppliementDataCount }],
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
        text: 'Supplement Sales count',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }
  public updateMonthlySalesIncome(data: any): void {
    const monthlySuppliementDataIncome = data.map((data: any) => {
      return {
        x: data.month,
        y: data.cnt
      };
    });

    this.monthlySalesIncomeOptions = {
      series: [{ name: 'Supplement Sales Income', data: monthlySuppliementDataIncome }],
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
        text: 'Supplement Sales Income',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }
}
