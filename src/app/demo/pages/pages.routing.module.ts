import { Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { MemberRegistrationComponent } from './member-registration/member-registration.component';
import { WorkoutManagementComponent } from './workout-management/workout-management.component';
import { SupplierRegistrationComponent } from './supplier-registration/supplier-registration.component';
import { EquipmentRegistrationComponent } from './equipment-registration/equipment-registration.component';
import { BeginnerWorkoutPlanComponent } from './beginner-workout-plan/beginner-workout-plan.component';

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
  },
  {
    path: 'workout',
    component: WorkoutManagementComponent
  },
  {
    path: 'suppliers',
    component: SupplierRegistrationComponent
  },
  {
    path: 'equipments',
    component: EquipmentRegistrationComponent
  },

  {
    path: 'beginner-workout-plan',
    component: BeginnerWorkoutPlanComponent
  },
];
