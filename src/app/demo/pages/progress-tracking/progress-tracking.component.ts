import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddNewProgressDialogComponent } from '../add-new-progress-dialog/add-new-progress-dialog.component';
import { HttpService } from 'src/app/services/http.service';
import { NewProgressServiceService } from 'src/app/services/new-progress/new-progress-service.service';
import { subscribe } from 'diagnostics_channel';

export interface BodyMeasurement {
  date: Date;
  weight: number;
  bmi?: number;
  bodyFat?: number;
  // Other optional fields you may want to add later...
}

@Component({
  selector: 'app-progress-tracking',
  standalone: false,
  templateUrl: './progress-tracking.component.html',
  styleUrl: './progress-tracking.component.scss'
})
export class ProgressTrackingComponent {

  bodyMeasurements: BodyMeasurement[] = [];
  weightChartOptions: any = {};
  bmiChartOptions: any = {};
  bodyFatChartOptions: any = {};
  dataSource = new MatTableDataSource<any>();
  userName = this.http.getLoginNameFromCache();
  latestImage: any;
  previousImage: any;

  constructor(
    private progressService: NewProgressServiceService,
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.populateData();
    // this.populateImageComparison();
  }

  populateData() {
    const userName = this.userName;

    this.progressService.getWeightOverTimeData(userName).subscribe({
      next: (data) => {
        this.bodyMeasurements = data.map((entry: any) => {
          const [year, month, day] = entry.date;
          return {
            date: new Date(year, month - 1, day),
            weight: entry.weight,
            bmi: entry.bmi,
            bodyFat: entry.bodyFat
          };
        });

        this.bodyMeasurements.sort((a, b) => a.date.getTime() - b.date.getTime());

        this.updateWeightChart();
        this.updateBmiChart();
        this.updateBodyFatChart();
      },
      error: (err) => {
        console.error('Error fetching progress data', err);
      }
    });


    // getting data for the image comparison
    this.progressService.getData().subscribe({
      next: (response) => {
        console.log(response);
        
      }
    })
  }


  // populateImageComparison(): void {
  //   this.progressService.getProgressPhotos(this.userName).subscribe({
  //     next: (data) => {
  //       const sorted = data
  //         .filter((d: any) => d.frontImage || d.sideImage || d.backImage)
  //         .map((entry: any) => ({
  //           ...entry,
  //           date: new Date(entry.date),  // ✅ fixed this
  //           frontImage: entry.frontImage ? this.createImageUrl(entry.frontImage, entry.frontImageType) : null,
  //           sideImage: entry.sideImage ? this.createImageUrl(entry.sideImage, entry.sideImageType) : null,
  //           backImage: entry.backImage ? this.createImageUrl(entry.backImage, entry.backImageType) : null
  //         }))
  //         .sort((a, b) => a.date.getTime() - b.date.getTime());

  //         console.log("date: ", sorted);
          

  //       if (sorted.length >= 2) {
  //         this.previousImage = sorted[sorted.length - 2];
  //         this.latestImage = sorted[sorted.length - 1];
  //       } else {
  //         this.previousImage = null;
  //         this.latestImage = null;
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Failed to load progress images', err);
  //     }
  //   });
  // }

  createImageUrl(byteArray: any, mimeType: string): string {
    const binary = new Uint8Array(byteArray).reduce((data, byte) => data + String.fromCharCode(byte), '');
    return `data:${mimeType};base64,${btoa(binary)}`;
  }

  readonly dialog = inject(MatDialog);

  openDialog(): void {
    const dialogRef = this.dialog.open(AddNewProgressDialogComponent, {
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
        this.populateData(); // Refresh all charts after adding new data
      }
    });
  }

  private updateWeightChart(): void {
    const weightData = this.bodyMeasurements.map(m => ({
      x: m.date.getTime(),
      y: m.weight
    }));

    this.weightChartOptions = {
      series: [{ name: 'Body Weight', data: weightData }],
      chart: { type: 'line', height: 350, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#6b7280' } } },
      yaxis: { title: { text: 'Weight (kg)', style: { color: '#6b7280' } }, labels: { style: { colors: '#6b7280' } } },
      colors: ['#10b981'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 6, hover: { size: 8 } },
      grid: { borderColor: '#e5e7eb' },
      title: { text: 'Body Weight Tracking', align: 'center', style: { color: '#1f2937', fontSize: '16px' } }
    };
  }

  private updateBmiChart(): void {
    const bmiData = this.bodyMeasurements.map(m => ({
      x: m.date.getTime(),
      y: m.bmi
    }));

    this.bmiChartOptions = {
      series: [{ name: 'BMI', data: bmiData }],
      chart: { type: 'line', height: 350, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#6b7280' } } },
      yaxis: { title: { text: 'BMI', style: { color: '#6b7280' } }, labels: { style: { colors: '#6b7280' } } },
      colors: ['#f59e0b'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 6, hover: { size: 8 } },
      grid: { borderColor: '#e5e7eb' },
      title: { text: 'BMI Over Time', align: 'center', style: { color: '#1f2937', fontSize: '16px' } }
    };
  }

  private updateBodyFatChart(): void {
    const bodyFatData = this.bodyMeasurements.map(m => ({
      x: m.date.getTime(),
      y: m.bodyFat
    }));

    this.bodyFatChartOptions = {
      series: [{ name: 'Body Fat %', data: bodyFatData }],
      chart: { type: 'line', height: 350, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#6b7280' } } },
      yaxis: { title: { text: 'Body Fat %', style: { color: '#6b7280' } }, labels: { style: { colors: '#6b7280' } } },
      colors: ['#3b82f6'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 6, hover: { size: 8 } },
      grid: { borderColor: '#e5e7eb' },
      title: { text: 'Body Fat Percentage Over Time', align: 'center', style: { color: '#1f2937', fontSize: '16px' } }
    };
  }

  refreshData(): void {
    this.populateData();
  }
}
