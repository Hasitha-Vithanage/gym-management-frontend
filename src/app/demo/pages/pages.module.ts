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
import { SupplementCheckoutComponent } from './supplement-checkout/supplement-checkout.component';
import { EmployeeListComponent } from './reports/static-reports/components/employee-list/employee-list.component';
import { NewEmployeeDialogComponent } from './new-employee-dialog/new-employee-dialog.component';
import { QrCodeComponent } from './qr-container/qr-code/qr-code.component';
import { NewMemberDialogComponent } from './new-member-dialog/new-member-dialog.component';
import { AssignTrainerDialogComponent } from './assign-trainer-dialog/assign-trainer-dialog.component';
import { AssignTrainerComponent } from './assign-trainer/assign-trainer.component';
import { MemberListComponent } from './reports/static-reports/components/member-list/member-list.component';
import { TrainerLoginComponent } from './trainer-login/trainer-login/trainer-login.component';
import { MemberLoginComponent } from './member-login/member-login/member-login.component';
import { GymChartsComponent } from './gym-charts/gym-charts.component';
import { WorkoutPlanUploadComponent } from './workout-plan-upload/workout-plan-upload.component';
import { PendingNutritionRequestsComponent } from './pending-nutrition-requests/pending-nutrition-requests.component';
import { PendingTrainerRequestsComponent } from './pending-trainer-requests/pending-trainer-requests.component';
import { UploadWorkoutPlanDialogComponent } from './upload-workout-plan-dialog/upload-workout-plan-dialog.component';
import { MyWorkoutPlanComponent } from './my-workout-plan/my-workout-plan.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { MarkAttendanceComponent } from './mark-attendance/mark-attendance.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { RejectRequestDialogComponent } from './reject-request-dialog/reject-request-dialog.component';
import { AllFeedbacksComponent } from './all-feedbacks/all-feedbacks.component';
import { AddClassComponent } from './add-class/add-class.component';
import { AddClassDialogComponent } from './add-class-dialog/add-class-dialog.component';
import { BookClassComponent } from './book-class/book-class.component';
import { BookClassSubmitComponent } from './book-class-submit/book-class-submit.component';
import { PaymentsComponent } from './payments/payments.component';
import { PaymentsDialogComponent } from './payments-dialog/payments-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TrainerLoginDialogComponent } from './trainer-login-dialog/trainer-login-dialog.component';
import { MemberLoginDialogComponent } from './member-login-dialog/member-login-dialog.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { MonthlyAttendanceComponent } from './monthly-attendance/monthly-attendance.component';
import { MonthlySalesComponent } from './monthly-sales/monthly-sales.component';
import { ForYourApprovalComponent } from './for-your-approval/for-your-approval.component';
import { GoalBasedCalorieTargetComponent } from './goal-based-calorie-target/goal-based-calorie-target.component';
import { WorkoutPlanGeneratorComponent } from './workout-plan-generator/workout-plan-generator.component';
import { ManageExerciseComponent } from './manage-exercise/manage-exercise.component';
import { AddExerciseComponent } from './manage-exercise/add-exercise/add-exercise.component';
import { WorkoutTemplateComponent } from './manage-exercise/workout-template/workout-template.component';
import { AddWorkoutTemplateComponent } from './manage-exercise/workout-template/add-workout-template/add-workout-template.component';
import { ExerciseToTemplateComponent } from './manage-exercise/workout-template/exercise-to-template/exercise-to-template.component';
import { TrainerMemberProgressComponent } from './trainer-member-progress/trainer-member-progress.component';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ManageFoodItemsComponent } from './manage-food-items/manage-food-items.component';
import { AddFoodItemComponent } from './manage-food-items/add-food-item/add-food-item.component';
import { MealPlanTemplateComponent } from './meal-plan-template/meal-plan-template.component';
import { AddMealPlanTemplateComponent } from './meal-plan-template/add-meal-plan-template/add-meal-plan-template.component';
import { FoodToTemplateComponent } from './food-to-template/food-to-template.component';
import { AssignMealPlanComponent } from './assign-meal-plan/assign-meal-plan.component';
import { MyAttendanceComponent } from './my-attendance/my-attendance.component';
import { AttendanceAnalyticsComponent } from './attendance-analytics/attendance-analytics.component';
import { EquipmentManagementComponent } from './equipment-management/equipment-management.component';
import { LogMaintenanceDialogComponent } from './log-maintenance-dialog/log-maintenance-dialog.component';
// icons

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/DD/YYYY'
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@NgModule({
  declarations: [
    TestComponent,
    FormDemoComponent,
    EmployeeRegistrationComponent,
    NewEmployeeDialogComponent,
    MemberRegistrationComponent,
    NewMemberDialogComponent,
    WorkoutManagementComponent,
    SupplierRegistrationComponent,
    NewSupplierDialogComponent,
    EquipmentRegistrationComponent,
    NewEquipmentDialogComponent,
    ProgressTrackingComponent,
    AddNewProgressDialogComponent,
    RatingsAndFeedbackComponent,
    NutritionAndMealPlanComponent,
    SupplementInventoryManagementComponent,
    SalesAndRequestsComponent,
    MySupplementOrdersComponent,
    NewSupplementDialogComponent,
    BrowseSupplementsComponent,
    SupplementDetailsComponent,
    SupplementCheckoutComponent,
    EmployeeListComponent,
    QrCodeComponent,
    AssignTrainerComponent,
    AssignTrainerDialogComponent,
    MemberListComponent,
    TrainerLoginComponent,
    MemberLoginComponent,
    GymChartsComponent,
    WorkoutPlanUploadComponent,
    PendingNutritionRequestsComponent,
    PendingTrainerRequestsComponent,
    UploadWorkoutPlanDialogComponent,
    MyWorkoutPlanComponent,
    UserProfileComponent,
    MarkAttendanceComponent,
    ConfirmDialogComponent,
    RejectRequestDialogComponent,
    AllFeedbacksComponent,
    AddClassComponent,
    AddClassDialogComponent,
    BookClassComponent,
    BookClassSubmitComponent,
    PaymentsComponent,
    PaymentsDialogComponent,
    TrainerLoginDialogComponent,
    MemberLoginDialogComponent,
    OrderDetailsComponent,
    MonthlyAttendanceComponent,
    MonthlySalesComponent,
    ForYourApprovalComponent,
    GoalBasedCalorieTargetComponent,
    WorkoutPlanGeneratorComponent,
    ManageExerciseComponent,
    AddExerciseComponent,
    WorkoutTemplateComponent,
    AddWorkoutTemplateComponent,
    ExerciseToTemplateComponent,
    TrainerMemberProgressComponent,
    MemberDashboardComponent,
    MyBookingsComponent,
    ManageFoodItemsComponent,
    AddFoodItemComponent,
    MealPlanTemplateComponent,
    AddMealPlanTemplateComponent,
    FoodToTemplateComponent,
    AssignMealPlanComponent,
    MyAttendanceComponent,
    AttendanceAnalyticsComponent,
    EquipmentManagementComponent,
    LogMaintenanceDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    RouterModule.forChild(PagesRoutes),
    MaterialModule,
    ReactiveFormsModule,
    NgxChartsModule,
    ZXingScannerModule,
],
  exports: [],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATE_FORMATS
    }
  ]
})
export class PagesModule {}
