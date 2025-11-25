import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMealPlanComponent } from './upload-meal-plan.component';

describe('UploadMealPlanComponent', () => {
  let component: UploadMealPlanComponent;
  let fixture: ComponentFixture<UploadMealPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadMealPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadMealPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
