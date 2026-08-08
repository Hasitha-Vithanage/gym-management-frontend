import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionAndMealPlanComponent } from './nutrition-and-meal-plan.component';

describe('NutritionAndMealPlanComponent', () => {
  let component: NutritionAndMealPlanComponent;
  let fixture: ComponentFixture<NutritionAndMealPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionAndMealPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionAndMealPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
