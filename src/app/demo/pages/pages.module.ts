import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagesRoutes } from './pages.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatDialog } from '@angular/material/dialog';
import { TestComponent } from './test/test.component';
import { MaterialModule } from 'src/app/material.module';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { MemberRegistrationComponent } from './member-registration/member-registration.component';
import { WorkoutManagementComponent } from './workout-management/workout-management.component';
import { SupplierRegistrationComponent } from './supplier-registration/supplier-registration.component';
import { NewSupplierDialogComponent } from './new-supplier-dialog/new-supplier-dialog.component';
// icons

@NgModule({
  declarations: [TestComponent, FormDemoComponent, EmployeeRegistrationComponent, MemberRegistrationComponent, WorkoutManagementComponent, SupplierRegistrationComponent, NewSupplierDialogComponent],
  imports: [CommonModule, FormsModule, NgApexchartsModule, RouterModule.forChild(PagesRoutes), MaterialModule, ReactiveFormsModule],
  exports: []
})
export class PagesModule {}
