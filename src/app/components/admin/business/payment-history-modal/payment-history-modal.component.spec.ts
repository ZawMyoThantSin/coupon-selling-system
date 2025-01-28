import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryModalComponent } from './payment-history-modal.component';

describe('PaymentHistoryModalComponent', () => {
  let component: PaymentHistoryModalComponent;
  let fixture: ComponentFixture<PaymentHistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
