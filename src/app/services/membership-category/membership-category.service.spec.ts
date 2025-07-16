import { TestBed } from '@angular/core/testing';

import { MembershipCategoryService } from './membership-category.service';

describe('MembershipCategoryService', () => {
  let service: MembershipCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MembershipCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
