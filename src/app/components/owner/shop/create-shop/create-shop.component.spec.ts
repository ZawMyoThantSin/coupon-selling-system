import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShopComponent } from './create-shop.component';

describe('CreateShopComponent', () => {
  let component: CreateShopComponent;
  let fixture: ComponentFixture<CreateShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
