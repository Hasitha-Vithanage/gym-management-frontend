import { TestBed } from '@angular/core/testing';

import { RatingAndFeedbackServiceService } from './rating-and-feedback-service.service';

describe('RatingAndFeedbackServiceService', () => {
  let service: RatingAndFeedbackServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingAndFeedbackServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
