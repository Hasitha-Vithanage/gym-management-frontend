import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseSupplementsComponent } from './browse-supplements.component';

describe('BrowseSupplementsComponent', () => {
  let component: BrowseSupplementsComponent;
  let fixture: ComponentFixture<BrowseSupplementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseSupplementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseSupplementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
