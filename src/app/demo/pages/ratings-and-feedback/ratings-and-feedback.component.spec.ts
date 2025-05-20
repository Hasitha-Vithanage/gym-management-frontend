import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingsAndFeedbackComponent } from './ratings-and-feedback.component';

describe('RatingsAndFeedbackComponent', () => {
  let component: RatingsAndFeedbackComponent;
  let fixture: ComponentFixture<RatingsAndFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingsAndFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingsAndFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
