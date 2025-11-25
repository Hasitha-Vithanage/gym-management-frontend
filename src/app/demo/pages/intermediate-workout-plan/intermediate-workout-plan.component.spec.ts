import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntermediateWorkoutPlanComponent } from './intermediate-workout-plan.component';

describe('IntermediateWorkoutPlanComponent', () => {
  let component: IntermediateWorkoutPlanComponent;
  let fixture: ComponentFixture<IntermediateWorkoutPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntermediateWorkoutPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntermediateWorkoutPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
