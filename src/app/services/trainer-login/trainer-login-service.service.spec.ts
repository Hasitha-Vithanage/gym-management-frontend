import { TestBed } from '@angular/core/testing';

import { TrainerLoginServiceService } from './trainer-login-service.service';

describe('TrainerLoginServiceService', () => {
  let service: TrainerLoginServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerLoginServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
