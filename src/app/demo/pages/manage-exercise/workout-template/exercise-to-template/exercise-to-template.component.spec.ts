import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseToTemplateComponent } from './exercise-to-template.component';

describe('ExerciseToTemplateComponent', () => {
  let component: ExerciseToTemplateComponent;
  let fixture: ComponentFixture<ExerciseToTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseToTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseToTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
