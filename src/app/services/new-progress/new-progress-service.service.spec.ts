import { TestBed } from '@angular/core/testing';

import { NewProgressServiceService } from './new-progress-service.service';

describe('NewProgressServiceService', () => {
  let service: NewProgressServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewProgressServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
