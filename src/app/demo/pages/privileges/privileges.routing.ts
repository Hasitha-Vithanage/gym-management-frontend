import { Routes } from '@angular/router';
import { SystemPrivilegesComponent } from './system-privileges/system-privileges.component';
import { TestComponent } from '../test/test.component';
import { PrivilegeGroupsComponent } from './privilege-groups/privilege-groups.component';

export const PrivilegesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '/system-privileges',
        pathMatch: 'full',
      },
      {
        path: 'system-privileges',
        component: SystemPrivilegesComponent,
      },
      {
        path: 'privilege-groups',
        component: PrivilegeGroupsComponent,
      },
      {
        path: 'system-test',
        component: TestComponent,
      },
    ],
  },
];
