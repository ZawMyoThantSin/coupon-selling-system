import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedCouponComponent } from './used-coupon.component';

describe('UsedCouponComponent', () => {
  let component: UsedCouponComponent;
  let fixture: ComponentFixture<UsedCouponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsedCouponComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsedCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
