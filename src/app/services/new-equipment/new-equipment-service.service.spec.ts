import { TestBed } from '@angular/core/testing';

import { NewEquipmentServiceService } from './new-equipment-service.service';

describe('NewEquipmentServiceService', () => {
  let service: NewEquipmentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewEquipmentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
