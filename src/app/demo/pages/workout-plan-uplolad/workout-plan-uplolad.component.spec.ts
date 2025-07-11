import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlanUploladComponent } from './workout-plan-uplolad.component';

describe('WorkoutPlanUploladComponent', () => {
  let component: WorkoutPlanUploladComponent;
  let fixture: ComponentFixture<WorkoutPlanUploladComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlanUploladComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlanUploladComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
