import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthSelectionModalComponent } from './month-selection-modal.component';

describe('MonthSelectionModalComponent', () => {
  let component: MonthSelectionModalComponent;
  let fixture: ComponentFixture<MonthSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthSelectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
