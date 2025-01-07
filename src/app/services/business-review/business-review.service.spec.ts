import { TestBed } from '@angular/core/testing';

import { BusinessReviewService } from './business-review.service';

describe('BusinessReviewService', () => {
  let service: BusinessReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
