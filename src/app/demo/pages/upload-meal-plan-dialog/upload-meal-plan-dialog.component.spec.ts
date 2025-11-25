import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMealPlanDialogComponent } from './upload-meal-plan-dialog.component';

describe('UploadMealPlanDialogComponent', () => {
  let component: UploadMealPlanDialogComponent;
  let fixture: ComponentFixture<UploadMealPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadMealPlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadMealPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
