import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipCategoriesDialogComponent } from './membership-categories-dialog.component';

describe('MembershipCategoriesDialogComponent', () => {
  let component: MembershipCategoriesDialogComponent;
  let fixture: ComponentFixture<MembershipCategoriesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipCategoriesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipCategoriesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
