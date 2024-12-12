import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusinessOwnerComponent } from './add-business-owner.component';

describe('AddBusinessOwnerComponent', () => {
  let component: AddBusinessOwnerComponent;
  let fixture: ComponentFixture<AddBusinessOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBusinessOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusinessOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
