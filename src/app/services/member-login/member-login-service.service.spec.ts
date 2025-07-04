import { TestBed } from '@angular/core/testing';

import { MemberLoginServiceService } from './member-login-service.service';

describe('MemberLoginServiceService', () => {
  let service: MemberLoginServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberLoginServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
