import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddNewProgressDialogComponent } from '../add-new-progress-dialog/add-new-progress-dialog.component';
import { WorkoutService } from 'src/app/services/gym-charts-service/gym-charts.service';
import { HttpService } from 'src/app/services/http.service';

export interface BodyMeasurement {
  date: Date;
  weight: number;
  bodyFat?: number;
  muscle?: number;
  chest?: number;
  arms?: number;
  waist?: number;
  thighs?: number;
}


@Component({
  selector: 'app-progress-tracking',
  standalone: false,
  templateUrl: './progress-tracking.component.html',
  styleUrl: './progress-tracking.component.scss'
})
export class ProgressTrackingComponent {

  supplierList: any[] = [];  // List of suppliers
  bodyMeasurements: BodyMeasurement[] = [];
  weightChartOptions: any = {};
  userName = this.http.getLoginNameFromCache();

  constructor(
    private workoutService: WorkoutService,
    private http: HttpService,
  ) { }

  // OnInit function
  ngOnInit(): void {

    this.workoutService.bodyMeasurements$.subscribe((measurements) => {
      this.bodyMeasurements = measurements;
      this.updateWeightChart();
    });
  }

    dataSource = new MatTableDataSource<any>;

  /* Refresh button function */
  refreshData(): void {
  }

  // Open dialog Box function
  readonly dialog = inject(MatDialog);
  openDialog(): void {
    const dialogRef = this.dialog.open(AddNewProgressDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
      }
    });
  }

  private updateWeightChart(): void {
    const weightData = this.bodyMeasurements.map((measurement) => ({
      x: measurement.date.getTime(),
      y: measurement.weight
    }));

    this.weightChartOptions = {
      series: [{ name: 'Body Weight', data: weightData }],
      chart: {
        type: 'line',
        height: 350,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#6b7280'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Weight (lbs)',
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
      colors: ['#10b981'],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 6,
        hover: {
          size: 8
        }
      },
      grid: {
        borderColor: '#e5e7eb'
      },
      title: {
        text: 'Body Weight Tracking',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }

}
