import { TestBed } from '@angular/core/testing';

import { EmployeePrintServiceService } from './employee-print-service.service';

describe('EmployeePrintServiceService', () => {
  let service: EmployeePrintServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeePrintServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
