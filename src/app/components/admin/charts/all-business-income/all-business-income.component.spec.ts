import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBusinessIncomeComponent } from './all-business-income.component';

describe('AllBusinessIncomeComponent', () => {
  let component: AllBusinessIncomeComponent;
  let fixture: ComponentFixture<AllBusinessIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllBusinessIncomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllBusinessIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
