import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegeGroupsAddEditComponent } from './privilege-groups-add-edit.component';

describe('PrivilegeGroupsAddEditComponent', () => {
  let component: PrivilegeGroupsAddEditComponent;
  let fixture: ComponentFixture<PrivilegeGroupsAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivilegeGroupsAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivilegeGroupsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
