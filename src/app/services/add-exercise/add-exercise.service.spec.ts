import { TestBed } from '@angular/core/testing';

import { AddExerciseService } from './add-exercise.service';

describe('AddExerciseService', () => {
  let service: AddExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
