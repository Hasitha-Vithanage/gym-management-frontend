import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalBasedCalorieTargetComponent } from './goal-based-calorie-target.component';

describe('GoalBasedCalorieTargetComponent', () => {
  let component: GoalBasedCalorieTargetComponent;
  let fixture: ComponentFixture<GoalBasedCalorieTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalBasedCalorieTargetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalBasedCalorieTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
