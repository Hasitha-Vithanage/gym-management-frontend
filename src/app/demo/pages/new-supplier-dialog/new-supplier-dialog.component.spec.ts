import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSupplierDialogComponent } from './new-supplier-dialog.component';

describe('NewSupplierDialogComponent', () => {
  let component: NewSupplierDialogComponent;
  let fixture: ComponentFixture<NewSupplierDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSupplierDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSupplierDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
