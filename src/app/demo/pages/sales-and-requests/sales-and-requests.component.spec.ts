import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAndRequestsComponent } from './sales-and-requests.component';

describe('SalesAndRequestsComponent', () => {
  let component: SalesAndRequestsComponent;
  let fixture: ComponentFixture<SalesAndRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAndRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAndRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
