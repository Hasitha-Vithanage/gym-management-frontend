import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForYourApprovalComponent } from './for-your-approval.component';

describe('ForYourApprovalComponent', () => {
  let component: ForYourApprovalComponent;
  let fixture: ComponentFixture<ForYourApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForYourApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForYourApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
