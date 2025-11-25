import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipCategoriesComponent } from './membership-categories.component';

describe('MembershipCategoriesComponent', () => {
  let component: MembershipCategoriesComponent;
  let fixture: ComponentFixture<MembershipCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
