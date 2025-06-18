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
import { RatingsAndFeedbackComponent } from './ratings-and-feedback/ratings-and-feedback.component';
import { NutritionAndMealPlanComponent } from './nutrition-and-meal-plan/nutrition-and-meal-plan.component';
import { SupplementInventoryManagementComponent } from './supplement-inventory-management/supplement-inventory-management.component';
import { SalesAndRequestsComponent } from './sales-and-requests/sales-and-requests.component';
import { MySupplementOrdersComponent } from './my-supplement-orders/my-supplement-orders.component';
import { NewSupplementDialogComponent } from './new-supplement-dialog/new-supplement-dialog.component';
import { BrowseSupplementsComponent } from './browse-supplements/browse-supplements.component';
import { SupplementDetailsComponent } from './supplement-details/supplement-details.component';
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
    AddNewProgressDialogComponent,
    RatingsAndFeedbackComponent,
    NutritionAndMealPlanComponent,
    SupplementInventoryManagementComponent,
    SalesAndRequestsComponent,
    MySupplementOrdersComponent,
    NewSupplementDialogComponent,
    BrowseSupplementsComponent,
    SupplementDetailsComponent
  ],
  imports: [CommonModule, FormsModule, NgApexchartsModule, RouterModule.forChild(PagesRoutes), MaterialModule, ReactiveFormsModule, NgxChartsModule],
  exports: []
})
export class PagesModule {}
