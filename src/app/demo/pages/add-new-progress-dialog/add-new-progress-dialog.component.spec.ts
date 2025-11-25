import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewProgressDialogComponent } from './add-new-progress-dialog.component';

describe('AddNewProgressDialogComponent', () => {
  let component: AddNewProgressDialogComponent;
  let fixture: ComponentFixture<AddNewProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewProgressDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
