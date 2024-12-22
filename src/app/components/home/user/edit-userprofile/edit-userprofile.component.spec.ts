import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserprofileComponent } from './edit-userprofile.component';

describe('EditUserprofileComponent', () => {
  let component: EditUserprofileComponent;
  let fixture: ComponentFixture<EditUserprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserprofileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
