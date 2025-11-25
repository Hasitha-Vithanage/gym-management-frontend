import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemPrivilegesComponent } from './system-privileges.component';

describe('SystemPrivilegesComponent', () => {
  let component: SystemPrivilegesComponent;
  let fixture: ComponentFixture<SystemPrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemPrivilegesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemPrivilegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
