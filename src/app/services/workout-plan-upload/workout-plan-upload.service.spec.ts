import { TestBed } from '@angular/core/testing';

import { WorkoutPlanUploadService } from './workout-plan-upload.service';

describe('WorkoutPlanUploadService', () => {
  let service: WorkoutPlanUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutPlanUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
