import { TestBed } from '@angular/core/testing';

import { PurchaseCouponService } from './purchase-coupon.service';

describe('PurchaseCouponService', () => {
  let service: PurchaseCouponService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseCouponService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
