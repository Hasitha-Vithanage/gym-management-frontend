import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddNewProgressDialogComponent } from '../add-new-progress-dialog/add-new-progress-dialog.component';
import { HttpService } from 'src/app/services/http.service';
import { NewProgressServiceService } from 'src/app/services/new-progress/new-progress-service.service';
import { WorkoutSessionService } from 'src/app/services/workout-session/workout-session.service';
import { UserWorkoutAssignmentService } from 'src/app/services/user-workout-assignment/user-workout-assignment.service';
import { WorkoutTemplatesService } from 'src/app/services/workout-templates/workout-templates.service';

export interface BodyMeasurement {
  date: Date;
  weight: number;
  bmi?: number;
  bodyFat?: number;
}

@Component({
  selector: 'app-progress-tracking',
  standalone: false,
  templateUrl: './progress-tracking.component.html',
  styleUrl: './progress-tracking.component.scss'
})
export class ProgressTrackingComponent implements OnInit {

  // ── Body measurement data (existing) ────────────────────────────────────────
  bodyMeasurements: BodyMeasurement[] = [];
  weightChartOptions: any = {};
  bmiChartOptions: any = {};
  bodyFatChartOptions: any = {};
  dataSource = new MatTableDataSource<any>();
  userName = this.http.getLoginNameFromCache();
  latestImage: any;
  previousImage: any;

  // ── Workout session data (new) ───────────────────────────────────────────────
  activeAssignmentId: number | null = null;
  templateExercises: any[] = [];
  selectedExerciseId: number | null = null;
  frequencyChartOptions: any = {};
  exerciseChartOptions: any = {};
  workoutDataLoading = false;
  noWorkoutData = false;

  readonly dialog = inject(MatDialog);

  constructor(
    private readonly progressService: NewProgressServiceService,
    private readonly http: HttpService,
    private readonly sessionService: WorkoutSessionService,
    private readonly assignmentService: UserWorkoutAssignmentService,
    private readonly workoutTemplatesService: WorkoutTemplatesService
  ) {}

  ngOnInit(): void {
    this.populateData();
    this.loadWorkoutData();
  }

  // ── Body measurements (existing logic, cleaned up) ───────────────────────────

  populateData(): void {
    this.progressService.getWeightOverTimeData(this.userName).subscribe({
      next: (data) => {
        this.bodyMeasurements = data
          .map((entry: any) => {
            const [year, month, day] = entry.date;
            return {
              date: new Date(year, month - 1, day),
              weight: entry.weight,
              bmi: entry.bmi,
              bodyFat: entry.bodyFat
            };
          })
          .sort((a: BodyMeasurement, b: BodyMeasurement) => a.date.getTime() - b.date.getTime());

        this.updateWeightChart();
        this.updateBmiChart();
        this.updateBodyFatChart();
      },
      error: () => {}
    });

    this.progressService.getData().subscribe({ next: () => {}, error: () => {} });
  }

  createImageUrl(byteArray: any, mimeType: string): string {
    const binary = new Uint8Array(byteArray).reduce((data, byte) => data + String.fromCharCode(byte), '');
    return `data:${mimeType};base64,${btoa(binary)}`;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddNewProgressDialogComponent, { autoFocus: false });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'add') {
        this.dataSource.data = [result.data, ...this.dataSource.data];
        this.populateData();
      }
    });
  }

  refreshData(): void {
    this.populateData();
    this.loadWorkoutData();
  }

  // ── Workout session charts (new) ─────────────────────────────────────────────

  private loadWorkoutData(): void {
    const userId = Number(this.http.getUserId());
    if (!userId) return;

    this.workoutDataLoading = true;

    this.assignmentService.getActiveAssignment(userId).subscribe({
      next: (assignment) => {
        if (!assignment?.template) {
          this.workoutDataLoading = false;
          this.noWorkoutData = true;
          return;
        }

        this.activeAssignmentId = assignment.id;
        this.loadFrequencyChart(assignment.id);
        this.loadTemplateExercises(assignment.template.id!);
        this.workoutDataLoading = false;
      },
      error: () => {
        this.workoutDataLoading = false;
        this.noWorkoutData = true;
      }
    });
  }

  private loadTemplateExercises(templateId: number): void {
    this.workoutTemplatesService.getTemplateExercises(templateId).subscribe({
      next: (exercises) => {
        const seen = new Set<number>();
        this.templateExercises = exercises.filter(ex => {
          if (seen.has(ex.exerciseId)) return false;
          seen.add(ex.exerciseId);
          return true;
        });

        if (this.templateExercises.length > 0) {
          this.selectedExerciseId = this.templateExercises[0].exerciseId;
          this.loadExerciseChart(this.selectedExerciseId!);
        }
      },
      error: () => {}
    });
  }

  private loadFrequencyChart(assignmentId: number): void {
    this.sessionService.getWeeklyFrequency(assignmentId).subscribe({
      next: (data) => {
        const labels = data.map((_: any, i: number) => `Week ${i + 1}`);
        const counts = data.map((d: any) => Number(d.session_count ?? d.sessionCount ?? 0));
        this.buildFrequencyChart(labels, counts);
      },
      error: () => { this.buildFrequencyChart([], []); }
    });
  }

  onExerciseSelect(exerciseId: number): void {
    this.selectedExerciseId = exerciseId;
    this.loadExerciseChart(exerciseId);
  }

  private loadExerciseChart(exerciseId: number): void {
    const userId = Number(this.http.getUserId());
    if (!userId || !exerciseId) return;

    this.sessionService.getExercisePerformance(userId, exerciseId).subscribe({
      next: (data) => {
        const points = data.map((d: any) => ({
          x: new Date(d.date).getTime(),
          y: d.weight ?? 0
        }));
        this.buildExerciseChart(points);
      },
      error: () => { this.buildExerciseChart([]); }
    });
  }

  private buildFrequencyChart(categories: string[], data: number[]): void {
    this.frequencyChartOptions = {
      series: [{ name: 'Sessions', data }],
      chart: {
        type: 'bar',
        height: 280,
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 700 },
        background: 'transparent'
      },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      dataLabels: { enabled: false },
      xaxis: { categories, labels: { style: { colors: '#9BA3B8', fontFamily: 'Plus Jakarta Sans, sans-serif' } } },
      yaxis: {
        title: { text: 'Sessions', style: { color: '#9BA3B8' } },
        labels: { style: { colors: '#9BA3B8' } },
        tickAmount: 4,
        min: 0
      },
      colors: ['#FF6B00'],
      grid: { borderColor: 'rgba(255,255,255,0.06)' },
      tooltip: { theme: 'dark' }
    };
  }

  private buildExerciseChart(data: { x: number; y: number }[]): void {
    this.exerciseChartOptions = {
      series: [{ name: 'Weight (kg)', data }],
      chart: {
        type: 'line',
        height: 280,
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 700 },
        background: 'transparent'
      },
      xaxis: {
        type: 'datetime',
        labels: { style: { colors: '#9BA3B8', fontFamily: 'Plus Jakarta Sans, sans-serif' } }
      },
      yaxis: {
        title: { text: 'Weight (kg)', style: { color: '#9BA3B8' } },
        labels: { style: { colors: '#9BA3B8' } }
      },
      colors: ['#3B82F6'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 5, hover: { size: 7 } },
      grid: { borderColor: 'rgba(255,255,255,0.06)' },
      tooltip: { theme: 'dark' },
      noData: { text: 'No session data yet. Log your first workout to see performance here.', style: { color: '#5D6478' } }
    };
  }

  // ── Body measurement charts (existing) ────────────────────────────────────────

  private updateWeightChart(): void {
    const weightData = this.bodyMeasurements.map(m => ({ x: m.date.getTime(), y: m.weight }));
    this.weightChartOptions = {
      series: [{ name: 'Body Weight', data: weightData }],
      chart: { type: 'line', height: 280, animations: { enabled: true, easing: 'easeinout', speed: 800 }, background: 'transparent', toolbar: { show: false } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#9BA3B8', fontFamily: 'Plus Jakarta Sans, sans-serif' } } },
      yaxis: { title: { text: 'Weight (kg)', style: { color: '#9BA3B8' } }, labels: { style: { colors: '#9BA3B8' } } },
      colors: ['#22C55E'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 5, hover: { size: 7 } },
      grid: { borderColor: 'rgba(255,255,255,0.06)' },
      tooltip: { theme: 'dark' }
    };
  }

  private updateBmiChart(): void {
    const bmiData = this.bodyMeasurements.map(m => ({ x: m.date.getTime(), y: m.bmi }));
    this.bmiChartOptions = {
      series: [{ name: 'BMI', data: bmiData }],
      chart: { type: 'line', height: 280, animations: { enabled: true, easing: 'easeinout', speed: 800 }, background: 'transparent', toolbar: { show: false } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#9BA3B8', fontFamily: 'Plus Jakarta Sans, sans-serif' } } },
      yaxis: { title: { text: 'BMI', style: { color: '#9BA3B8' } }, labels: { style: { colors: '#9BA3B8' } } },
      colors: ['#FBBF24'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 5, hover: { size: 7 } },
      grid: { borderColor: 'rgba(255,255,255,0.06)' },
      tooltip: { theme: 'dark' }
    };
  }

  private updateBodyFatChart(): void {
    const bodyFatData = this.bodyMeasurements.map(m => ({ x: m.date.getTime(), y: m.bodyFat }));
    this.bodyFatChartOptions = {
      series: [{ name: 'Body Fat %', data: bodyFatData }],
      chart: { type: 'line', height: 280, animations: { enabled: true, easing: 'easeinout', speed: 800 }, background: 'transparent', toolbar: { show: false } },
      xaxis: { type: 'datetime', labels: { style: { colors: '#9BA3B8', fontFamily: 'Plus Jakarta Sans, sans-serif' } } },
      yaxis: { title: { text: 'Body Fat %', style: { color: '#9BA3B8' } }, labels: { style: { colors: '#9BA3B8' } } },
      colors: ['#3B82F6'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 5, hover: { size: 7 } },
      grid: { borderColor: 'rgba(255,255,255,0.06)' },
      tooltip: { theme: 'dark' }
    };
  }
}
