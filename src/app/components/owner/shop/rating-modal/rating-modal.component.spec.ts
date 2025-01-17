import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingModalComponent } from './rating-modal.component';

describe('RatingModalComponent', () => {
  let component: RatingModalComponent;
  let fixture: ComponentFixture<RatingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
