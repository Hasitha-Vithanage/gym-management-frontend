import { TestBed } from '@angular/core/testing';

import { FormDemoServiceService } from './form-demo-service.service';

describe('FormDemoServiceService', () => {
  let service: FormDemoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormDemoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
