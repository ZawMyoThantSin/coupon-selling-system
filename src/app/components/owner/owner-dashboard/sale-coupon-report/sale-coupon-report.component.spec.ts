import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleCouponReportComponent } from './sale-coupon-report.component';

describe('SaleCouponReportComponent', () => {
  let component: SaleCouponReportComponent;
  let fixture: ComponentFixture<SaleCouponReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleCouponReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleCouponReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
