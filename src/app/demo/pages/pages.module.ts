import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagesRoutes } from './pages.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TestComponent } from './test/test.component';
import { MaterialModule } from 'src/app/material.module';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { MemberRegistrationComponent } from './member-registration/member-registration.component';
import { WorkoutManagementComponent } from './workout-management/workout-management.component';
import { SupplierRegistrationComponent } from './supplier-registration/supplier-registration.component';
import { NewSupplierDialogComponent } from './new-supplier-dialog/new-supplier-dialog.component';
import { EquipmentRegistrationComponent } from './equipment-registration/equipment-registration.component';
import { NewEquipmentDialogComponent } from './new-equipment-dialog/new-equipment-dialog.component';
import { BeginnerWorkoutPlanComponent } from './beginner-workout-plan/beginner-workout-plan.component';
import { ProgressTrackingComponent } from './progress-tracking/progress-tracking.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AddNewProgressDialogComponent } from './add-new-progress-dialog/add-new-progress-dialog.component';
// icons

@NgModule({
  declarations: [
    TestComponent,
    FormDemoComponent,
    EmployeeRegistrationComponent,
    MemberRegistrationComponent,
    WorkoutManagementComponent,
    SupplierRegistrationComponent,
    NewSupplierDialogComponent,
    EquipmentRegistrationComponent,
    NewEquipmentDialogComponent,
    WorkoutManagementComponent,
    BeginnerWorkoutPlanComponent,
    ProgressTrackingComponent,
    AddNewProgressDialogComponent
  ],
  imports: [CommonModule, FormsModule, NgApexchartsModule, RouterModule.forChild(PagesRoutes), MaterialModule, ReactiveFormsModule, NgxChartsModule],
  exports: []
})
export class PagesModule {}
