import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplementCheckoutComponent } from './supplement-checkout.component';

describe('SupplementCheckoutComponent', () => {
  let component: SupplementCheckoutComponent;
  let fixture: ComponentFixture<SupplementCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplementCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplementCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
