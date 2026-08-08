import { TestBed } from '@angular/core/testing';

import { WorkoutManagementService } from './workout-management.service';

describe('WorkoutManagementService', () => {
  let service: WorkoutManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
