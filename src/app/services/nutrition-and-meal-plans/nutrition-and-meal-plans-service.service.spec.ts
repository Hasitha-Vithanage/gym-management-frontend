import { TestBed } from '@angular/core/testing';

import { NutritionAndMealPlansServiceService } from './nutrition-and-meal-plans-service.service';

describe('NutritionAndMealPlansServiceService', () => {
  let service: NutritionAndMealPlansServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutritionAndMealPlansServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
