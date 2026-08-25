import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddNewProgressDialogComponent } from '../add-new-progress-dialog/add-new-progress-dialog.component';
import { HttpService } from 'src/app/services/http.service';
import { NewProgressServiceService } from 'src/app/services/new-progress/new-progress-service.service';
import { WorkoutSessionService } from 'src/app/services/workout-session/workout-session.service';
import { UserWorkoutAssignmentService } from 'src/app/services/user-workout-assignment/user-workout-assignment.service';
import { WorkoutTemplatesService } from 'src/app/services/workout-templates/workout-templates.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { UserMealPlanAssignmentMealService } from 'src/app/services/user-meal-plan-assignment-meal/user-meal-plan-assignment-meal.service';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';

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
  measurementsLoading = true;
  weightChartOptions: any = {};
  bmiChartOptions: any = {};
  bodyFatChartOptions: any = {};
  dataSource = new MatTableDataSource<any>();
  userName = this.http.getLoginNameFromCache();

  // Pre-fill data from last workout request (for new members with no measurements)
  prefillData: { 
    weight: number; 
    height: number; 
    gender: string; 
    bmi: number; 
    bmiCategory: string; 
    estimatedBodyFat: number | null } | null = null;

  // ── Meal plan data ────────────────────────────────────────────────────────────
  mealPlanLoading = false;
  activeMealAssignment: any = null;
  todayMealItems: any[] = [];
  currentPlanDay = 1;

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
    private readonly workoutTemplatesService: WorkoutTemplatesService,
    private readonly workoutService: WorkoutManagementService,
    private readonly mealAssignmentService: UserMealPlanAssignmentMealService,
    private readonly mealTemplateService: MealPlanTemplateService
  ) {}

  ngOnInit(): void {
    this.populateData();
    this.loadWorkoutData();
    this.loadMealPlanData();
  }

  // ── Body measurements (existing logic, cleaned up) ───────────────────────────

  populateData(): void {
    this.measurementsLoading = true;
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

        this.measurementsLoading = false;
        this.updateWeightChart();
        this.updateBmiChart();
        this.updateBodyFatChart();

        // Load prefill data for new members with no measurements
        if (this.bodyMeasurements.length === 0) {
          this.loadPrefillFromWorkoutRequest();
        }
      },
      error: () => { this.measurementsLoading = false; }
    });

    this.progressService.getData().subscribe({ next: () => {}, error: () => {} });
  }

  private loadPrefillFromWorkoutRequest(): void {
    const memberName = this.http.getFullNameFromCache() || this.http.getLoginNameFromCache() || '';
    if (!memberName) return;

    this.workoutService.getMyLastRequest(memberName).subscribe({
      next: (req: any) => {
        if (!req?.weight || !req?.height) return;

        const bmi   = +(req.weight / Math.pow(req.height / 100, 2)).toFixed(1);
        const sex   = req.gender?.toLowerCase() === 'male' ? 1 : 0;
        let bmiCat: string;
        if (bmi < 18.5)      bmiCat = 'Underweight';
        else if (bmi < 25)   bmiCat = 'Normal';
        else if (bmi < 30)   bmiCat = 'Overweight';
        else                 bmiCat = 'Obese';
        const estBf = req.age
          ? +((1.20 * bmi) + (0.23 * req.age) - (10.8 * sex) - 5.4).toFixed(1)
          : null;

        this.prefillData = {
          weight: req.weight,
          height: req.height,
          gender: req.gender,
          bmi,
          bmiCategory: bmiCat,
          estimatedBodyFat: estBf
        };
      },
      error: () => {}
    });
  }

  openDialog(usePrefill = false): void {
    const dialogRef = this.dialog.open(AddNewProgressDialogComponent, {
      autoFocus: false,
      data: usePrefill && this.prefillData ? this.prefillData : null
    });
    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  refreshData(): void {
    this.populateData();
    this.loadWorkoutData();
  }

  // ── Meal plan data ────────────────────────────────────────────────────────────

  private loadMealPlanData(): void {
    const userId = this.http.getLoginNameFromCache();
    if (!userId) return;

    this.mealPlanLoading = true;
    this.mealAssignmentService.getActiveAssignment(userId).subscribe({
      next: (assignment: any) => {
        if (assignment) {
          this.activeMealAssignment = assignment;
          this.calculateCurrentPlanDay(assignment.startDate);
          this.loadTodayMealItems(assignment.templateId);
        } else {
          this.mealPlanLoading = false;
        }
      },
      error: () => { this.mealPlanLoading = false; }
    });
  }

  private calculateCurrentPlanDay(startDateStr: string): void {
    const start = new Date(startDateStr).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceStart = Math.floor((today.getTime() - start) / msPerDay) + 1;
    this.currentPlanDay = ((daysSinceStart - 1) % 7) + 1;
  }

  private loadTodayMealItems(templateId: number): void {
    this.mealTemplateService.getMealItems(templateId).subscribe({
      next: (items: any[]) => {
        this.todayMealItems = items.filter((i) => Number(i.dayOfWeek) === this.currentPlanDay);
        this.mealPlanLoading = false;
      },
      error: () => { this.mealPlanLoading = false; }
    });
  }

  get todayCalories(): number {
    return Math.round(this.todayMealItems.reduce((s, i) => s + (i.caloriesForPortion ?? 0), 0));
  }

  get todayProtein(): number {
    return Math.round(this.todayMealItems.reduce((s, i) => s + (i.proteinG ?? 0), 0) * 10) / 10;
  }

  get todayCarbs(): number {
    return Math.round(this.todayMealItems.reduce((s, i) => s + (i.carbsG ?? 0), 0) * 10) / 10;
  }

  get todayFat(): number {
    return Math.round(this.todayMealItems.reduce((s, i) => s + (i.fatG ?? 0), 0) * 10) / 10;
  }

  progressPct(actual: number, target: number): number {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
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
