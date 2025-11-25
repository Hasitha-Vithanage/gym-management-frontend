import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTrainerDialogComponent } from './assign-trainer-dialog.component';

describe('AssignTrainerDialogComponent', () => {
  let component: AssignTrainerDialogComponent;
  let fixture: ComponentFixture<AssignTrainerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignTrainerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTrainerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
