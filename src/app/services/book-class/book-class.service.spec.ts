import { TestBed } from '@angular/core/testing';

import { BookClassService } from './book-class.service';

describe('BookClassService', () => {
  let service: BookClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
