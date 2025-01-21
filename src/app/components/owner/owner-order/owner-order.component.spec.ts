import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerOrderComponent } from './owner-order.component';

describe('OwnerOrderComponent', () => {
  let component: OwnerOrderComponent;
  let fixture: ComponentFixture<OwnerOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
