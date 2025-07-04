import { TestBed } from '@angular/core/testing';

import { AssignTrainerServiceService } from './assign-trainer-service.service';

describe('AssignTrainerServiceService', () => {
  let service: AssignTrainerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignTrainerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
