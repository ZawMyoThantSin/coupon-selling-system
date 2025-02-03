import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerNotiComponent } from './owner-noti.component';

describe('OwnerNotiComponent', () => {
  let component: OwnerNotiComponent;
  let fixture: ComponentFixture<OwnerNotiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerNotiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerNotiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
