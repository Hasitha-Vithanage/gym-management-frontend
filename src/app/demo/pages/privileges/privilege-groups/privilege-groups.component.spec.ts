import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegeGroupsComponent } from './privilege-groups.component';

describe('PrivilegeGroupsComponent', () => {
  let component: PrivilegeGroupsComponent;
  let fixture: ComponentFixture<PrivilegeGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivilegeGroupsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivilegeGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
