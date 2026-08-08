import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadWorkoutPlanDialogComponent } from './upload-workout-plan-dialog.component';

describe('UploadWorkoutPlanDialogComponent', () => {
  let component: UploadWorkoutPlanDialogComponent;
  let fixture: ComponentFixture<UploadWorkoutPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadWorkoutPlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadWorkoutPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
