import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeginnerWorkoutPlanComponent } from './beginner-workout-plan.component';

describe('BeginnerWorkoutPlanComponent', () => {
  let component: BeginnerWorkoutPlanComponent;
  let fixture: ComponentFixture<BeginnerWorkoutPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeginnerWorkoutPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeginnerWorkoutPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
