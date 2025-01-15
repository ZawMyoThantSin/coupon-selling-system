import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDashComponent } from './test-dash.component';

describe('TestDashComponent', () => {
  let component: TestDashComponent;
  let fixture: ComponentFixture<TestDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
