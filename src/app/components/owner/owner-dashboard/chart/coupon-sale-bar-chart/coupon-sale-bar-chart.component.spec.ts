import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponSaleBarChartComponent } from './coupon-sale-bar-chart.component';

describe('CouponSaleBarChartComponent', () => {
  let component: CouponSaleBarChartComponent;
  let fixture: ComponentFixture<CouponSaleBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponSaleBarChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponSaleBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
