import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressTrackingComponent } from './progress-tracking.component';

describe('ProgressTrackingComponent', () => {
  let component: ProgressTrackingComponent;
  let fixture: ComponentFixture<ProgressTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
