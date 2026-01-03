import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlanGeneratorComponent } from './workout-plan-generator.component';

describe('WorkoutPlanGeneratorComponent', () => {
  let component: WorkoutPlanGeneratorComponent;
  let fixture: ComponentFixture<WorkoutPlanGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlanGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlanGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
