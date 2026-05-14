import { TestBed } from '@angular/core/testing';

import { WorkoutTemplatesService } from './workout-templates.service';

describe('WorkoutTemplatesService', () => {
  let service: WorkoutTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
