import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplementInventoryManagementComponent } from './supplement-inventory-management.component';

describe('SupplementInventoryManagementComponent', () => {
  let component: SupplementInventoryManagementComponent;
  let fixture: ComponentFixture<SupplementInventoryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplementInventoryManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplementInventoryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
