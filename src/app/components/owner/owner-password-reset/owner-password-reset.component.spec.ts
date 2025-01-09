import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerPasswordResetComponent } from './owner-password-reset.component';

describe('OwnerPasswordResetComponent', () => {
  let component: OwnerPasswordResetComponent;
  let fixture: ComponentFixture<OwnerPasswordResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerPasswordResetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
