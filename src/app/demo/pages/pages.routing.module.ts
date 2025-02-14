import { Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { Component } from '@angular/core';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { MemberRegistrationComponent } from './member-registration/member-registration.component';

export const PagesRoutes: Routes = [
  {
    path: 'test',
    component: TestComponent
  },
  {
    path: 'privileges',
    loadChildren: () => import('./privileges/privileges.module').then((m) => m.PrivilegesModule)
  },
  {
    path: 'form-demo',
    component: FormDemoComponent
  },
  {
    path: 'employee',
    component: EmployeeRegistrationComponent
  },
  {
    path: 'member',
    component: MemberRegistrationComponent
  }
];
