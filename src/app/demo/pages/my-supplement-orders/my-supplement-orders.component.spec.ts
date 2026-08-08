import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySupplementOrdersComponent } from './my-supplement-orders.component';

describe('MySupplementOrdersComponent', () => {
  let component: MySupplementOrdersComponent;
  let fixture: ComponentFixture<MySupplementOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySupplementOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySupplementOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
