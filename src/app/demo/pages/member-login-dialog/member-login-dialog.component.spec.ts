import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberLoginDialogComponent } from './member-login-dialog.component';

describe('MemberLoginDialogComponent', () => {
  let component: MemberLoginDialogComponent;
  let fixture: ComponentFixture<MemberLoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberLoginDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
