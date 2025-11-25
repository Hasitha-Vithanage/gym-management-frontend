import { TestBed } from '@angular/core/testing';

import { NewSupplementServiceService } from './new-supplement-service.service';

describe('NewSupplementServiceService', () => {
  let service: NewSupplementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewSupplementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
