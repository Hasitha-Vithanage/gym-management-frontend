import { TestBed } from '@angular/core/testing';

import { AddClassService } from './add-class.service';

describe('AddClassService', () => {
  let service: AddClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
