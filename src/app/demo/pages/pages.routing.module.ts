import { Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { MemberRegistrationComponent } from './member-registration/member-registration.component';
import { WorkoutManagementComponent } from './workout-management/workout-management.component';
import { SupplierRegistrationComponent } from './supplier-registration/supplier-registration.component';
import { EquipmentRegistrationComponent } from './equipment-registration/equipment-registration.component';
import { ProgressTrackingComponent } from './progress-tracking/progress-tracking.component';
import { RatingsAndFeedbackComponent } from './ratings-and-feedback/ratings-and-feedback.component';
import { NutritionAndMealPlanComponent } from './nutrition-and-meal-plan/nutrition-and-meal-plan.component';
import { SupplementInventoryManagementComponent } from './supplement-inventory-management/supplement-inventory-management.component';
import { SalesAndRequestsComponent } from './sales-and-requests/sales-and-requests.component';
import { BrowseSupplementsComponent } from './browse-supplements/browse-supplements.component';
import { MySupplementOrdersComponent } from './my-supplement-orders/my-supplement-orders.component';
import { SupplementDetailsComponent } from './supplement-details/supplement-details.component';
import { SupplementCheckoutComponent } from './supplement-checkout/supplement-checkout.component';
import { EmployeeListComponent } from './reports/static-reports/components/employee-list/employee-list.component';
import { AssignTrainerComponent } from './assign-trainer/assign-trainer.component';
import { MemberListComponent } from './reports/static-reports/components/member-list/member-list.component';
import { TrainerLoginComponent } from './trainer-login/trainer-login/trainer-login.component';
import { MemberLoginComponent } from './member-login/member-login/member-login.component';
import { GymChartsComponent } from './gym-charts/gym-charts.component';
import { WorkoutPlanUploadComponent } from './workout-plan-upload/workout-plan-upload.component';
import { MyWorkoutPlanComponent } from './my-workout-plan/my-workout-plan.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { MarkAttendanceComponent } from './mark-attendance/mark-attendance.component';
import { AllFeedbacksComponent } from './all-feedbacks/all-feedbacks.component';
import { AddClassComponent } from './add-class/add-class.component';
import { BookClassComponent } from './book-class/book-class.component';
import { BookClassSubmitComponent } from './book-class-submit/book-class-submit.component';
import { PaymentsComponent } from './payments/payments.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { MonthlyAttendanceComponent } from './monthly-attendance/monthly-attendance.component';
import { MonthlySalesComponent } from './monthly-sales/monthly-sales.component';
import { ForYourApprovalComponent } from './for-your-approval/for-your-approval.component';
import { GoalBasedCalorieTargetComponent } from './goal-based-calorie-target/goal-based-calorie-target.component';
import { WorkoutPlanGeneratorComponent } from './workout-plan-generator/workout-plan-generator.component';
import { ManageExerciseComponent } from './manage-exercise/manage-exercise.component';
import { WorkoutTemplateComponent } from './manage-exercise/workout-template/workout-template.component';
import { ExerciseToTemplateComponent } from './manage-exercise/workout-template/exercise-to-template/exercise-to-template.component';
import { TrainerMemberProgressComponent } from './trainer-member-progress/trainer-member-progress.component';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { ManageFoodItemsComponent } from './manage-food-items/manage-food-items.component';
import { MealPlanTemplateComponent } from './meal-plan-template/meal-plan-template.component';
import { FoodToTemplateComponent } from './food-to-template/food-to-template.component';
import { AssignMealPlanComponent } from './assign-meal-plan/assign-meal-plan.component';

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
    path: 'for-your-approval',
    component: ForYourApprovalComponent
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
    path: 'workout-plan-generator',
    component: WorkoutPlanGeneratorComponent
  },
  {
    path: 'manage-exercise',
    component: ManageExerciseComponent
  },
  {
    path: 'workout-templates',
    component: WorkoutTemplateComponent
  },
  {
    path: 'exercise-to-template/:id',
    component: ExerciseToTemplateComponent
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
    path: 'progress-tracking',
    component: ProgressTrackingComponent
  },
  {
    path: 'trainer-member-progress',
    component: TrainerMemberProgressComponent
  },
  {
    path: 'ratings&feedback',
    component: RatingsAndFeedbackComponent
  },
  {
    path: 'nutrition&meal-plan',
    component: NutritionAndMealPlanComponent
  },
  {
    path: 'goal-based-calorie-target',
    component: GoalBasedCalorieTargetComponent
  },
  {
    path: 'supplement-inventory-management',
    component: SupplementInventoryManagementComponent
  },
  {
    path: 'supplement-sales-requests',
    component: SalesAndRequestsComponent
  },
  {
    path: 'browse-supplements',
    component: BrowseSupplementsComponent
  },
  {
    path: 'my-supplement-orders',
    component: MySupplementOrdersComponent
  },
  {
    path: 'supplement-details/:id',
    component: SupplementDetailsComponent
  },
  {
    path: 'supplement-details/:id/checkout',
    component: SupplementCheckoutComponent
  },
  {
    path: 'reports/employees-report',
    component: EmployeeListComponent
  },
  {
    path: 'assign-trainer',
    component: AssignTrainerComponent
  },
  {
    path: 'reports/members-report',
    component: MemberListComponent
  },
  {
    path: 'employee-login',
    component: TrainerLoginComponent
  },
  {
    path: 'member-login',
    component: MemberLoginComponent
  },
  {
    path: 'charts',
    component: GymChartsComponent
  },
  {
    path: 'workout-plan-upload',
    component: WorkoutPlanUploadComponent
  },
  {
    path: 'my-workout-plan',
    component: MyWorkoutPlanComponent
  },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
  {
    path: 'mark-attendance',
    component: MarkAttendanceComponent
  },
  {
    path: 'all-feedbacks',
    component: AllFeedbacksComponent
  },
  {
    path: 'add-class',
    component: AddClassComponent
  },
  {
    path: 'book-class',
    component: BookClassComponent
  },
  {
    path: 'book-class-submit/:id',
    component: BookClassSubmitComponent
  },
  {
    path: 'payments',
    component: PaymentsComponent
  },
  {
    path: 'order-details/:id',
    component: OrderDetailsComponent
  },
  {
    path: 'reports/monthly-attendance',
    component: MonthlyAttendanceComponent
  },
  {
    path: 'reports/monthly-sales',
    component: MonthlySalesComponent
  },
  {
    path: 'member-dashboard',
    component: MemberDashboardComponent
  },
  {
    path: 'my-bookings',
    component: MyBookingsComponent
  },
  {
    path: 'manage-food-items',
    component: ManageFoodItemsComponent
  },
  {
    path: 'meal-plan-templates',
    component: MealPlanTemplateComponent
  },
  {
    path: 'food-to-template/:id',
    component: FoodToTemplateComponent
  },
  {
    path: 'assign-meal-plan',
    component: AssignMealPlanComponent
  },
];
