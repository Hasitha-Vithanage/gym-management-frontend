import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTrainerComponent } from './assign-trainer.component';

describe('AssignTrainerComponent', () => {
  let component: AssignTrainerComponent;
  let fixture: ComponentFixture<AssignTrainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignTrainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
