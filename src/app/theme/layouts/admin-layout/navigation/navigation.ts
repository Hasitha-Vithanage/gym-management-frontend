import { authenticationEnum } from 'src/app/guards/auth.enum';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
  auth?: number[];
  isVisible?: boolean;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'home',
    title: 'Home',
    type: 'group',
    icon: '../../../../assets/images/icon/home-icon.png',
    auth: [authenticationEnum.Home_Dashboard],
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: '../../../../assets/images/icon/dashboard-light-icon.png',
        auth: [authenticationEnum.Home_Dashboard],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'manage',
    title: 'Manage',
    type: 'group',
    icon: '../../../../assets/images/icon/manage-icon.png',
    isVisible: false,
    auth: [authenticationEnum.System_Privileges, authenticationEnum.Privilege_Groups],
    children: [
      {
        id: 'systemPrivileges',
        title: 'System Privileges',
        type: 'item',
        url: '/pages/privileges/system-privileges',
        icon: '../../../../assets/images/icon/system-privileges-icon.png',
        breadcrumbs: false,
        classes: 'nav-item',
        auth: [authenticationEnum.System_Privileges],
        isVisible: false
      },
      {
        id: 'privilegeGroups',
        title: 'Privilege Grops',
        type: 'item',
        url: '/pages/privileges/privilege-groups',
        icon: '../../../../assets/images/icon/privilege-groups-icon.png',
        breadcrumbs: false,
        classes: 'nav-item',
        auth: [authenticationEnum.Privilege_Groups],
        isVisible: false
      },
      {
        id: 'employeeLogin',
        title: 'Employee Login',
        type: 'item',
        url: '/pages/employee-login',
        icon: '../../../../assets/images/icon/employee-login-icon.png',
        breadcrumbs: false,
        classes: 'nav-item',
        auth: [authenticationEnum.Trainer_Login],
        isVisible: false
      },
      {
        id: 'memberLogin',
        title: 'Member Login',
        type: 'item',
        url: '/pages/member-login',
        icon: '../../../../assets/images/icon/member-login-icon.png',
        breadcrumbs: false,
        classes: 'nav-item',
        auth: [authenticationEnum.Member_Login],
        isVisible: false
      }
    ]
  },

  /* side navigation bar item for form-demo */
  // {
  //   id: 'formDemo',
  //   title: 'Form-Demo',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   auth: authenticationEnum.Home,
  //   children: [
  //     {
  //       id: 'formDemoDet',
  //       title: 'Form Demo',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/pages/form-demo',
  //       icon: 'dashboard',
  //       auth: authenticationEnum.Home_Dashboard,
  //       breadcrumbs: false
  //     }
  //   ]
  // },

  /* side navigation bar item for employee registration form */
  {
    id: 'userManagement',
    title: 'User Management',
    type: 'group',
    icon: '../../../../assets/images/icon/user-management-icon.png',
    auth: [
      authenticationEnum.Employee_Registration,
      authenticationEnum.Member_Registration,
      authenticationEnum.Mark_Attendance,
      authenticationEnum.Assign_Trainer
    ],
    children: [
      {
        id: 'employeeDet',
        title: 'Employee Registration',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/employee',
        icon: '../../../../assets/images/icon/employee-light-icon.png',
        auth: [authenticationEnum.Employee_Registration],
        breadcrumbs: false
      },
      {
        id: 'memberDet',
        title: 'Member Registration',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/member',
        icon: '../../../../assets/images/icon/member-light-icon.png',
        auth: [authenticationEnum.Member_Registration],
        breadcrumbs: false
      },
      {
        id: 'attendanceDet',
        title: 'Mark Attendance',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/mark-attendance',
        icon: '../../../../assets/images/icon/mark-attendance-icon.png',
        auth: [authenticationEnum.Mark_Attendance],
        breadcrumbs: false
      },
      {
        id: 'assignTrainerDet',
        title: 'Assign Trainer',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/assign-trainer',
        icon: '../../../../assets/images/icon/assign-trainer-icon.png',
        auth: [authenticationEnum.Assign_Trainer],
        breadcrumbs: false
      }
    ]
  },

  /* side navigation bar item for member registration form */
  // {
  //   id: 'member',
  //   title: 'Member Registration',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   auth: authenticationEnum.Home,
  //   children: [
  //     {
  //       id: 'memberDet',
  //       title: 'Member Registration',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/pages/member',
  //       icon: '',
  //       auth: authenticationEnum.Home_Dashboard,
  //       breadcrumbs: false
  //     }
  //   ]
  // },
  /* side navigation bar item for workout management module */
  {
    id: 'workout',
    title: 'Workout Management',
    type: 'group',
    icon: '../../../../assets/images/icon/workout-management-icon.png',
    auth: [
      authenticationEnum.Workout_Plan,
      authenticationEnum.Workout_Plan_Upload,
      authenticationEnum.Workout_Plan_Diet,
      authenticationEnum.Progress_Tracking
    ],
    children: [
      {
        id: 'workoutDet',
        title: 'Workout Plan Requests',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/workout',
        icon: '../../../../assets/images/icon/workout-plan-icon.png',
        auth: [authenticationEnum.Workout_Plan],
        breadcrumbs: false
      },
      {
        id: 'workoutDet',
        title: 'Workout Plan Generator',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/workout-plan-generator',
        icon: '../../../../assets/images/icon/workout-plan-generator-light.png',
        auth: [authenticationEnum.Workout_Plan],
        breadcrumbs: false
      },
      {
        id: 'workoutPlanUploadDet',
        title: 'Upload Workout Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/workout-plan-upload',
        icon: '../../../../assets/images/icon/upload-icon.png',
        auth: [authenticationEnum.Workout_Plan_Upload],
        breadcrumbs: false
      },
      {
        id: 'myWorkoutPlanDet',
        title: 'My Workout Plans',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/my-workout-plan',
        icon: '../../../../assets/images/icon/my-workout-plan-icon.png',
        auth: [authenticationEnum.Workout_Plan_Diet],
        breadcrumbs: false
      },
      {
        id: 'progressTrackingDet',
        title: 'Progress Tracking',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/progress-tracking',
        icon: '../../../../assets/images/icon/progress-tracking-icon.png',
        auth: [authenticationEnum.Progress_Tracking],
        breadcrumbs: false
      }
    ]
  },
  // {
  //   id: 'gymChart',
  //   title: 'Gym Charts',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   auth: [authenticationEnum.Home_Dashboard],
  //   children: [
  //     {
  //       id: 'charts',
  //       title: 'Gym Chart Examples',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/pages/charts',
  //       icon: '',
  //       auth: [authenticationEnum.Home_Dashboard],
  //       breadcrumbs: false
  //     }
  //   ]
  // },
  /* side navigation bar item for nutrition & meal plan module */
  {
    id: 'classScheduling',
    title: 'Class Scheduling',
    type: 'group',
    icon: '../../../../assets/images/icon/class-scheduling-icon.png',
    auth: [authenticationEnum.Schedule_Class, authenticationEnum.Book_Class],
    children: [
      {
        id: 'addClassDet',
        title: 'Schedule Class',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/add-class',
        icon: '../../../../assets/images/icon/schedule-class-icon.png',
        auth: [authenticationEnum.Schedule_Class],
        breadcrumbs: false
      },
      {
        id: 'bookClassDet',
        title: 'Book Class',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/book-class',
        icon: '../../../../assets/images/icon/book-class-icon.png',
        auth: [authenticationEnum.Book_Class],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'nutrition&meal-plan',
    title: 'Nutrition & Meal Plan',
    type: 'group',
    icon: '../../../../assets/images/icon/nutrition-and-meal-icon.png',
    auth: [authenticationEnum.Nutrition_Meal_Plan, authenticationEnum.Upload_Nutrition_Meal_Plan],
    children: [
      {
        id: 'nutritionDet',
        title: 'Nutrition & Meal Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/nutrition&meal-plan',
        icon: '../../../../assets/images/icon/nutrition-and-meal-plans.png',
        auth: [authenticationEnum.Nutrition_Meal_Plan],
        breadcrumbs: false
      },
      {
        id: 'goalBasedCalorieTargetDet',
        title: 'Goal-Based Calorie Target',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/goal-based-calorie-target',
        icon: '../../../../assets/images/icon/nutrition-and-meal-plans.png',
        auth: [authenticationEnum.Nutrition_Meal_Plan],
        breadcrumbs: false
      },
      {
        id: 'uploadNutritionDet',
        title: 'Upload Meal Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/upload-meal-plan',
        icon: '../../../../assets/images/icon/upload-icon.png',
        auth: [authenticationEnum.Upload_Nutrition_Meal_Plan],
        breadcrumbs: false
      }
    ]
  },
  /* side navigation bar item for Progress Tracking module */
  // {
  //   id: 'ProgressTracking',
  //   title: 'Progress Tracking',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   auth: authenticationEnum.Home,
  //   children: [
  //     {
  //       id: 'progressTrackingDet',
  //       title: 'Progress Tracking',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/pages/progress-tracking',
  //       icon: '',
  //       auth: authenticationEnum.Home_Dashboard,
  //       breadcrumbs: false
  //     },
  //   ]
  // },
  /* side navigation bar item for workout management module */
  {
    id: 'SupplementStore',
    title: 'Supplement Store',
    type: 'group',
    icon: '../../../../assets/images/icon/supplement-store-icon.png',
    auth: [authenticationEnum.Inventory_Management],
    children: [
      {
        id: 'inventoryManagementDet',
        title: 'Inventory Management',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/supplement-inventory-management',
        icon: '../../../../assets/images/icon/supplement-inventory-icon.png',
        auth: [authenticationEnum.Inventory_Management],
        breadcrumbs: false
      },
      {
        id: 'salesRequestsDet',
        title: 'Sales & Requests',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/supplement-sales-requests',
        icon: '../../../../assets/images/icon/sales-and-request.png',
        auth: [authenticationEnum.Home_Dashboard],
        breadcrumbs: false
      },
      {
        id: 'browseSupplementsDet',
        title: 'Browse Supplements',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/browse-supplements',
        icon: '../../../../assets/images/icon/browse-supplements-icon.png',
        auth: [authenticationEnum.Browse_Suppliment],
        breadcrumbs: false
      }
      // {
      //   id: 'myOrdersDet',
      //   title: 'My Orders',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/pages/my-supplement-orders',
      //   icon: '',
      //   auth: authenticationEnum.Home_Dashboard,
      //   breadcrumbs: false
      // }
    ]
  },
  /* side navigation bar item for Workflow */
  {
    id: 'workflow',
    title: 'Workflow',
    type: 'group',
    icon: '../../../../assets/images/icon/workflow-icon.png',
    auth: [authenticationEnum.Home_Dashboard],
    children: [
      {
        id: 'forYourApprovalDet',
        title: 'For Your Approval',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/for-your-approval',
        icon: '../../../../assets/images/icon/for-your-approval-light-icon.png',
        auth: [authenticationEnum.Home_Dashboard],
        breadcrumbs: false
      }
    ]
  },
  /* side navigation bar item for Masters */
  {
    id: 'masters',
    title: 'Masters',
    type: 'group',
    icon: '../../../../assets/images/icon/masters-icon.png',
    auth: [authenticationEnum.Equipments, authenticationEnum.Suppliers, authenticationEnum.Membership_Category],
    children: [
      {
        id: 'equipmentsDet',
        title: 'Equipments',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/equipments',
        icon: '../../../../assets/images/icon/equipments-icon.png',
        auth: [authenticationEnum.Equipments],
        breadcrumbs: false
      },
      {
        id: 'supplierDet',
        title: 'Suppliers',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/suppliers',
        icon: '../../../../assets/images/icon/supplier-icon.png',
        auth: [authenticationEnum.Suppliers],
        breadcrumbs: false
      },
      {
        id: 'membershipCategoriesDet',
        title: 'Membership Categories',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/membership-categories',
        icon: '../../../../assets/images/icon/membership-categories-icon.png',
        auth: [authenticationEnum.Membership_Category],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    type: 'group',
    icon: '../../../../assets/images/icon/reports-icon.png',
    auth: [authenticationEnum.Employee_Report, authenticationEnum.Member_Report],
    children: [
      {
        id: 'employeeReport',
        title: 'Employees Report',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/employees-report',
        icon: '../../../../assets/images/icon/employee-report-icon.png',
        auth: [authenticationEnum.Employee_Report],
        breadcrumbs: false
      }, // add other reports to here
      {
        id: 'membersReport',
        title: 'Members Report',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/members-report',
        icon: '../../../../assets/images/icon/member-report-icon.png',
        auth: [authenticationEnum.Member_Report],
        breadcrumbs: false
      },
      {
        id: 'monthlyAttendance',
        title: 'Monthly Attendance',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/monthly-attendance',
        icon: '../../../../assets/images/icon/monthly-attendance-report-icon.png',
        auth: [authenticationEnum.Monthly_Attendance],
        breadcrumbs: false
      },
      {
        id: 'monthlySales',
        title: 'Monthly Sales',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/monthly-sales',
        icon: '../../../../assets/images/icon/sales-report-icon.png',
        auth: [authenticationEnum.Monthly_Sales],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments',
    type: 'group',
    icon: '../../../../assets/images/icon/payment-icon.png',
    auth: [authenticationEnum.Payments],
    children: [
      {
        id: 'payments',
        title: 'Payments',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/payments',
        icon: '../../../../assets/images/icon/make-payment-icon.png',
        auth: [authenticationEnum.Payments],
        breadcrumbs: false
      } // add other reports to here
    ]
  },
  {
    id: 'ratings',
    title: 'Ratings & Feedback',
    type: 'group',
    icon: '../../../../assets/images/icon/rating-and-feedbacks-icon.png',
    auth: [authenticationEnum.Ratings_And_Feedback, authenticationEnum.Feedback_History],
    children: [
      {
        id: 'ratingsDet',
        title: 'Ratings & Feedback',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/ratings&feedback',
        icon: '../../../../assets/images/icon/rating-icon.png',
        auth: [authenticationEnum.Ratings_And_Feedback],
        breadcrumbs: false
      },
      {
        id: 'allRatingsDet',
        title: 'Feedback History',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/all-feedbacks',
        icon: '../../../../assets/images/icon/history-icon.png',
        auth: [authenticationEnum.Feedback_History],
        breadcrumbs: false
      }
    ]
  },
  // {
  //   id: 'authentication',
  //   title: 'Authentication',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'login',
  //       title: 'Login',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/login',
  //       icon: 'login',
  //       target: true,
  //       breadcrumbs: false
  //     },
  //     {
  //       id: 'register',
  //       title: 'Register',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/register',
  //       icon: 'profile',
  //       target: true,
  //       breadcrumbs: false
  //     }
  //   ]
  // },
  // {
  //   id: 'utilities',
  //   title: 'UI Components',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'typography',
  //       title: 'Typography',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/typography',
  //       icon: 'font-size'
  //     },
  //     {
  //       id: 'color',
  //       title: 'Colors',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/color',
  //       icon: 'bg-colors'
  //     },
  //     {
  //       id: 'tabler',
  //       title: 'Tabler',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: 'https://ant.design/components/icon',
  //       icon: 'ant-design',
  //       target: true,
  //       external: true
  //     }
  //   ]
  // },
  // {
  //   id: 'other',
  //   title: 'Other',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'sample-page',
  //       title: 'Sample Page',
  //       type: 'item',
  //       url: '/sample-page',
  //       classes: 'nav-item',
  //       icon: 'chrome'
  //     },
  //     {
  //       id: 'document',
  //       title: 'Document',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: 'https://codedthemes.gitbook.io/mantis-angular/',
  //       icon: 'question',
  //       target: true,
  //       external: true
  //     }
  //   ]
  // }
];
