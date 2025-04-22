import { TestBed } from '@angular/core/testing';

import { NewSupplierServiceService } from './new-supplier-service.service';

describe('NewSupplierServiceService', () => {
  let service: NewSupplierServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewSupplierServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
