import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCouponModelComponent } from './share-coupon-model.component';

describe('ShareCouponModelComponent', () => {
  let component: ShareCouponModelComponent;
  let fixture: ComponentFixture<ShareCouponModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareCouponModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareCouponModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
