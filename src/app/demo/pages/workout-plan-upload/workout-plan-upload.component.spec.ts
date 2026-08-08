import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPlanUploadComponent } from './workout-plan-upload.component';

describe('WorkoutPlanUploadComponent', () => {
  let component: WorkoutPlanUploadComponent;
  let fixture: ComponentFixture<WorkoutPlanUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPlanUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPlanUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
