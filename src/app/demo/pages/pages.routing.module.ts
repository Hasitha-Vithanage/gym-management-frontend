import { Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { MemberRegistrationComponent } from './member-registration/member-registration.component';
import { WorkoutManagementComponent } from './workout-management/workout-management.component';
import { SupplierRegistrationComponent } from './supplier-registration/supplier-registration.component';
import { EquipmentRegistrationComponent } from './equipment-registration/equipment-registration.component';
import { BeginnerWorkoutPlanComponent } from './beginner-workout-plan/beginner-workout-plan.component';
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
import { IntermediateWorkoutPlanComponent } from './intermediate-workout-plan/intermediate-workout-plan.component';
import { GymChartsComponent } from './gym-charts/gym-charts.component';
import { WorkoutPlanUploadComponent } from './workout-plan-upload/workout-plan-upload.component';
import { MyWorkoutPlanComponent } from './my-workout-plan/my-workout-plan.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { MarkAttendanceComponent } from './mark-attendance/mark-attendance.component';
import { AllFeedbacksComponent } from './all-feedbacks/all-feedbacks.component';
import { UploadMealPlanComponent } from './upload-meal-plan/upload-meal-plan.component';
import { AddClassComponent } from './add-class/add-class.component';
import { BookClassComponent } from './book-class/book-class.component';
import { BookClassSubmitComponent } from './book-class-submit/book-class-submit.component';
import { MembershipCategoriesComponent } from './membership-categories/membership-categories.component';
import { PaymentsComponent } from './payments/payments.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

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
  {
    path: 'progress-tracking',
    component: ProgressTrackingComponent
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
    path: 'trainer-login',
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
     { path: 'intermediate-workout-plan',
    component: IntermediateWorkoutPlanComponent
  }, 
     { path: 'workout-plan-upload',
    component: WorkoutPlanUploadComponent
  }, 
     { path: 'my-workout-plan',
    component: MyWorkoutPlanComponent
  }, 
     { path: 'user-profile',
    component: UserProfileComponent
  }, 
     { path: 'mark-attendance',
    component: MarkAttendanceComponent
  }, 
     { path: 'all-feedbacks',
    component: AllFeedbacksComponent
  }, 
     { path: 'upload-meal-plan',
    component: UploadMealPlanComponent
  }, 
     { path: 'add-class',
    component: AddClassComponent
  }, 
     { path: 'book-class',
    component: BookClassComponent
  }, 
     { path: 'book-class-submit/:id',
    component: BookClassSubmitComponent
  }, 
     { path: 'membership-categories',
    component: MembershipCategoriesComponent
  }, 
     { path: 'payments',
    component: PaymentsComponent
  }, 
     { path: 'order-details/:id',
    component: OrderDetailsComponent
  }, 
];
