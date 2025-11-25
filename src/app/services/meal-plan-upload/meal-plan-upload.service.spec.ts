import { TestBed } from '@angular/core/testing';

import { MealPlanUploadService } from './meal-plan-upload.service';

describe('MealPlanUploadService', () => {
  let service: MealPlanUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealPlanUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
