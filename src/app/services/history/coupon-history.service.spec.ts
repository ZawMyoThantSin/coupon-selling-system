import { TestBed } from '@angular/core/testing';

import { CouponHistoryService } from './coupon-history.service';

describe('CouponHistoryService', () => {
  let service: CouponHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CouponHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
