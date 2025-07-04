import { Component, OnInit } from '@angular/core';
import { WorkoutService } from 'src/app/services/gym-charts-service/gym-charts.service';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  restTime?: number;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: Date;
  exercises: WorkoutExercise[];
  duration: number;
  notes?: string;
}

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

export interface ProgressStats {
  totalWorkouts: number;
  totalWeight: number;
  averageWorkoutDuration: number;
  strongestLifts: { [key: string]: number };
}

@Component({
  selector: 'app-gym-charts',
  standalone: false,
  templateUrl: './gym-charts.component.html',
  styleUrl: './gym-charts.component.scss'
})
export class GymChartsComponent implements OnInit {
  workouts: Workout[] = [];
  bodyMeasurements: BodyMeasurement[] = [];

  strengthChartOptions: any = {};
  weightChartOptions: any = {};
  volumeChartOptions: any = {};
  muscleGroupChartOptions: any = {};

  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {
    this.workoutService.workouts$.subscribe((workouts) => {
      this.workouts = workouts;
      this.updateStrengthChart();
      this.updateVolumeChart();
      this.updateMuscleGroupChart();
    });

    this.workoutService.bodyMeasurements$.subscribe((measurements) => {
      this.bodyMeasurements = measurements;
      this.updateWeightChart();
    });
  }

  private updateStrengthChart(): void {
    const benchPressData = this.getExerciseProgressData('Bench Press');
    const squatData = this.getExerciseProgressData('Squats');
    const deadliftData = this.getExerciseProgressData('Deadlift');

    this.strengthChartOptions = {
      series: [
        { name: 'Bench Press', data: benchPressData },
        { name: 'Squats', data: squatData },
        { name: 'Deadlift', data: deadliftData }
      ],
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
      colors: ['#3b82f6', '#10b981', '#f97316'],
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
        text: 'Max Weight Progress',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
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

  private updateVolumeChart(): void {
    const volumeData = this.workouts.map((workout) => {
      const totalVolume = workout.exercises.reduce(
        (sum, exercise) => sum + exercise.sets.reduce((setSum, set) => setSum + set.reps * set.weight, 0),
        0
      );
      return {
        x: workout.date.getTime(),
        y: totalVolume
      };
    });

    this.volumeChartOptions = {
      series: [{ name: 'Training Volume', data: volumeData }],
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
        type: 'datetime',
        labels: {
          style: {
            colors: '#6b7280'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Volume (lbs)',
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
        text: 'Training Volume per Workout',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }

  private updateMuscleGroupChart(): void {
    const muscleGroupCount: { [key: string]: number } = {};

    this.workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const muscleGroup = exercise.exercise.muscleGroup;
        muscleGroupCount[muscleGroup] = (muscleGroupCount[muscleGroup] || 0) + 1;
      });
    });

    const labels = Object.keys(muscleGroupCount);
    const data = Object.values(muscleGroupCount);

    this.muscleGroupChartOptions = {
      series: data,
      chart: {
        type: 'donut',
        height: 350,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      labels: labels,
      colors: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'],
      legend: {
        position: 'bottom',
        labels: {
          colors: '#6b7280'
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%'
          }
        }
      },
      title: {
        text: 'Exercises by Muscle Group',
        align: 'center',
        style: {
          color: '#1f2937',
          fontSize: '16px'
        }
      }
    };
  }

  private getExerciseProgressData(exerciseName: string): any[] {
    const exerciseData: any[] = [];

    this.workouts.forEach((workout) => {
      const exercise = workout.exercises.find((e) => e.exercise.name === exerciseName);
      if (exercise) {
        const maxWeight = Math.max(...exercise.sets.map((set) => set.weight));
        exerciseData.push({
          x: workout.date.getTime(),
          y: maxWeight
        });
      }
    });

    return exerciseData.sort((a, b) => a.x - b.x);
  }
}
