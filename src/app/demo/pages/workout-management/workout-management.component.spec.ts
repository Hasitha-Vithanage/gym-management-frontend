import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutManagementComponent } from './workout-management.component';

describe('WorkoutManagementComponent', () => {
  let component: WorkoutManagementComponent;
  let fixture: ComponentFixture<WorkoutManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
