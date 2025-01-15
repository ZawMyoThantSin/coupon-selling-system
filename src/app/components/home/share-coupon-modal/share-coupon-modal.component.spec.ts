import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareCouponModalComponent } from './share-coupon-modal.component';

describe('ShareCouponModalComponent', () => {
  let component: ShareCouponModalComponent;
  let fixture: ComponentFixture<ShareCouponModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareCouponModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareCouponModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
