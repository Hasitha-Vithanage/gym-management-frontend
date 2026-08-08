import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkoutTemplateComponent } from './add-workout-template.component';

describe('AddWorkoutTemplateComponent', () => {
  let component: AddWorkoutTemplateComponent;
  let fixture: ComponentFixture<AddWorkoutTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWorkoutTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWorkoutTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
