import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendDetailComponent } from './friend-detail.component';

describe('FriendDetailComponent', () => {
  let component: FriendDetailComponent;
  let fixture: ComponentFixture<FriendDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
