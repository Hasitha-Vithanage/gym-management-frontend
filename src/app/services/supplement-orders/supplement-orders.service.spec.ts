import { TestBed } from '@angular/core/testing';

import { SupplementOrdersService } from './supplement-orders.service';

describe('SupplementOrdersService', () => {
  let service: SupplementOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplementOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
