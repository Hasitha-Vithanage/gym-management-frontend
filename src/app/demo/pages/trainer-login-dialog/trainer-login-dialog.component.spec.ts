import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerLoginDialogComponent } from './trainer-login-dialog.component';

describe('TrainerLoginDialogComponent', () => {
  let component: TrainerLoginDialogComponent;
  let fixture: ComponentFixture<TrainerLoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerLoginDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
