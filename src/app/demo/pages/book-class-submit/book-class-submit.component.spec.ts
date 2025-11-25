import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookClassSubmitComponent } from './book-class-submit.component';

describe('BookClassSubmitComponent', () => {
  let component: BookClassSubmitComponent;
  let fixture: ComponentFixture<BookClassSubmitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookClassSubmitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookClassSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
