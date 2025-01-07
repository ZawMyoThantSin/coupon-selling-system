import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestBarChartComponent } from './test-bar-chart.component';

describe('TestBarChartComponent', () => {
  let component: TestBarChartComponent;
  let fixture: ComponentFixture<TestBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestBarChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
