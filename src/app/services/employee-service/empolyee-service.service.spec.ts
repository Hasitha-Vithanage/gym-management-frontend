import { TestBed } from '@angular/core/testing';

import { EmpolyeeServiceService } from './empolyee-service.service';

describe('EmpolyeeServiceService', () => {
  let service: EmpolyeeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpolyeeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
