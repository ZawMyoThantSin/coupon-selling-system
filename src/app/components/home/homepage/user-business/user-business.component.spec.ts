import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBusinessComponent } from './user-business.component';

describe('UserBusinessComponent', () => {
  let component: UserBusinessComponent;
  let fixture: ComponentFixture<UserBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBusinessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
