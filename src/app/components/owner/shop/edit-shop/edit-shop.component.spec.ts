import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShopComponent } from './edit-shop.component';

describe('EditShopComponent', () => {
  let component: EditShopComponent;
  let fixture: ComponentFixture<EditShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
