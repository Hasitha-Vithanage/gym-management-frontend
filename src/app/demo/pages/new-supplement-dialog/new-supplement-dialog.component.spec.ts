import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSupplementDialogComponent } from './new-supplement-dialog.component';

describe('NewSupplementDialogComponent', () => {
  let component: NewSupplementDialogComponent;
  let fixture: ComponentFixture<NewSupplementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSupplementDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSupplementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
