import { TestBed } from '@angular/core/testing';

import { UsedCouponService } from './used-coupon.service';

describe('UsedCouponService', () => {
  let service: UsedCouponService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsedCouponService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
