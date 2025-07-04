import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private workoutsSubject = new BehaviorSubject<Workout[]>([]);
  private bodyMeasurementsSubject = new BehaviorSubject<BodyMeasurement[]>([]);

  public workouts$ = this.workoutsSubject.asObservable();
  public bodyMeasurements$ = this.bodyMeasurementsSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    // Mock workout data
    const mockWorkouts: Workout[] = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        exercises: [
          {
            exercise: { id: '1', name: 'Bench Press', category: 'Strength', muscleGroup: 'Chest' },
            sets: [
              { reps: 10, weight: 185 },
              { reps: 8, weight: 195 },
              { reps: 6, weight: 205 }
            ]
          },
          {
            exercise: { id: '2', name: 'Squats', category: 'Strength', muscleGroup: 'Legs' },
            sets: [
              { reps: 12, weight: 225 },
              { reps: 10, weight: 245 },
              { reps: 8, weight: 265 }
            ]
          }
        ],
        duration: 65,
        notes: 'Great workout, feeling strong!'
      },
      {
        id: '2',
        date: new Date('2024-01-17'),
        exercises: [
          {
            exercise: { id: '3', name: 'Deadlift', category: 'Strength', muscleGroup: 'Back' },
            sets: [
              { reps: 8, weight: 315 },
              { reps: 6, weight: 335 },
              { reps: 4, weight: 355 }
            ]
          }
        ],
        duration: 45,
        notes: 'Personal record on deadlift!'
      },
      {
        id: '3',
        date: new Date('2024-01-20'),
        exercises: [
          {
            exercise: { id: '1', name: 'Bench Press', category: 'Strength', muscleGroup: 'Chest' },
            sets: [
              { reps: 10, weight: 190 },
              { reps: 8, weight: 200 },
              { reps: 6, weight: 210 }
            ]
          }
        ],
        duration: 50
      }
    ];

    // Mock body measurements
    const mockMeasurements: BodyMeasurement[] = [
      { date: new Date('2024-01-01'), weight: 180, bodyFat: 15, muscle: 45, chest: 42, arms: 16, waist: 32, thighs: 24 },
      { date: new Date('2024-01-08'), weight: 181, bodyFat: 14.5, muscle: 45.5, chest: 42.2, arms: 16.1, waist: 31.8, thighs: 24.2 },
      { date: new Date('2024-01-15'), weight: 182, bodyFat: 14, muscle: 46, chest: 42.5, arms: 16.3, waist: 31.5, thighs: 24.5 },
      { date: new Date('2024-01-22'), weight: 183, bodyFat: 13.5, muscle: 46.5, chest: 42.8, arms: 16.5, waist: 31.2, thighs: 24.8 }
    ];

    this.workoutsSubject.next(mockWorkouts);
    this.bodyMeasurementsSubject.next(mockMeasurements);
  }

  getAvailableExercises(): Exercise[] {
    return [
      { id: '1', name: 'Bench Press', category: 'Strength', muscleGroup: 'Chest' },
      { id: '2', name: 'Squats', category: 'Strength', muscleGroup: 'Legs' },
      { id: '3', name: 'Deadlift', category: 'Strength', muscleGroup: 'Back' },
      { id: '4', name: 'Overhead Press', category: 'Strength', muscleGroup: 'Shoulders' },
      { id: '5', name: 'Pull-ups', category: 'Strength', muscleGroup: 'Back' },
      { id: '6', name: 'Dips', category: 'Strength', muscleGroup: 'Chest' },
      { id: '7', name: 'Barbell Rows', category: 'Strength', muscleGroup: 'Back' },
      { id: '8', name: 'Lunges', category: 'Strength', muscleGroup: 'Legs' }
    ];
  }

  addWorkout(workout: Workout): void {
    const currentWorkouts = this.workoutsSubject.value;
    this.workoutsSubject.next([...currentWorkouts, workout]);
  }

  addBodyMeasurement(measurement: BodyMeasurement): void {
    const currentMeasurements = this.bodyMeasurementsSubject.value;
    this.bodyMeasurementsSubject.next([...currentMeasurements, measurement]);
  }

  getProgressStats(): Observable<ProgressStats> {
    return new Observable((observer) => {
      const workouts = this.workoutsSubject.value;
      const totalWorkouts = workouts.length;
      const totalWeight = workouts.reduce(
        (sum, workout) =>
          sum +
          workout.exercises.reduce(
            (exerciseSum, exercise) => exerciseSum + exercise.sets.reduce((setSum, set) => setSum + set.reps * set.weight, 0),
            0
          ),
        0
      );

      const averageWorkoutDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0) / totalWorkouts;

      const strongestLifts: { [key: string]: number } = {};
      workouts.forEach((workout) => {
        workout.exercises.forEach((exercise) => {
          const maxWeight = Math.max(...exercise.sets.map((set) => set.weight));
          if (!strongestLifts[exercise.exercise.name] || maxWeight > strongestLifts[exercise.exercise.name]) {
            strongestLifts[exercise.exercise.name] = maxWeight;
          }
        });
      });

      observer.next({
        totalWorkouts,
        totalWeight,
        averageWorkoutDuration,
        strongestLifts
      });
    });
  }
}
