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
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Home_Dashboard],
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        auth: [authenticationEnum.Home_Dashboard],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'privileges',
    title: 'Privileges',
    type: 'group',
    icon: 'icon-navigation',
    isVisible: false,
    auth: [authenticationEnum.System_Privileges, authenticationEnum.Privilege_Groups],
    children: [
      {
        id: 'systemPrivileges',
        title: 'System Privileges',
        type: 'item',
        url: '/pages/privileges/system-privileges',
        //icon: 'ti ti-dashboard',
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
        //icon: 'ti ti-dashboard',
        breadcrumbs: false,
        classes: 'nav-item',
        auth: [authenticationEnum.Privilege_Groups],
        isVisible: false
      },
      {
        id: 'trainerLogin',
        title: 'Trainer Login',
        type: 'item',
        url: '/pages/trainer-login',
        //icon: 'ti ti-dashboard',
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
        //icon: 'ti ti-dashboard',
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
    icon: 'icon-navigation',
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
        icon: '',
        auth: [authenticationEnum.Employee_Registration],
        breadcrumbs: false
      },
      {
        id: 'memberDet',
        title: 'Member Registration',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/member',
        icon: '',
        auth: [authenticationEnum.Member_Registration],
        breadcrumbs: false
      },
      {
        id: 'attendanceDet',
        title: 'Mark Attendance',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/mark-attendance',
        icon: '',
        auth: [authenticationEnum.Mark_Attendance],
        breadcrumbs: false
      },
      {
        id: 'assignTrainerDet',
        title: 'Assign Trainer',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/assign-trainer',
        icon: '',
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
    icon: 'icon-navigation',
    auth: [
      authenticationEnum.Workout_Plan,
      authenticationEnum.Workout_Plan_Upload,
      authenticationEnum.Workout_Plan_Diet,
      authenticationEnum.Progress_Tracking
    ],
    children: [
      {
        id: 'workoutDet',
        title: 'Workout Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/workout',
        icon: '',
        auth: [authenticationEnum.Workout_Plan],
        breadcrumbs: false
      },
      {
        id: 'workoutPlanUploadDet',
        title: 'Upload Workout Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/workout-plan-upload',
        icon: '',
        auth: [authenticationEnum.Workout_Plan_Upload],
        breadcrumbs: false
      },
      {
        id: 'myWorkoutPlanDet',
        title: 'My Workout Plans',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/my-workout-plan',
        icon: '',
        auth: [authenticationEnum.Workout_Plan_Diet],
        breadcrumbs: false
      },
      {
        id: 'progressTrackingDet',
        title: 'Progress Tracking',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/progress-tracking',
        icon: '',
        auth: [authenticationEnum.Progress_Tracking],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'gymChart',
    title: 'Gym Charts',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Home_Dashboard],
    children: [
      {
        id: 'charts',
        title: 'Gym Chart Examples',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/charts',
        icon: '',
        auth: [authenticationEnum.Home_Dashboard],
        breadcrumbs: false
      }
    ]
  },
  /* side navigation bar item for nutrition & meal plan module */
  {
    id: 'classScheduling',
    title: 'Class Scheduling',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Schedule_Class, authenticationEnum.Book_Class],
    children: [
      {
        id: 'addClassDet',
        title: 'Schedule Class',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/add-class',
        icon: '',
        auth: [authenticationEnum.Schedule_Class],
        breadcrumbs: false
      },
      {
        id: 'bookClassDet',
        title: 'Book Class',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/book-class',
        icon: '',
        auth: [authenticationEnum.Book_Class],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'nutrition&meal-plan',
    title: 'Nutrition & Meal Plan',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Nutrition_Meal_Plan, authenticationEnum.Upload_Nutrition_Meal_Plan],
    children: [
      {
        id: 'nutritionDet',
        title: 'Nutrition & Meal Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/nutrition&meal-plan',
        icon: '',
        auth: [authenticationEnum.Nutrition_Meal_Plan],
        breadcrumbs: false
      },
      {
        id: 'uploadNutritionDet',
        title: 'Upload Meal Plan',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/upload-meal-plan',
        icon: '',
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
    icon: 'icon-navigation',
    auth: [authenticationEnum.Inventory_Management],
    children: [
      {
        id: 'inventoryManagementDet',
        title: 'Inventory Management',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/supplement-inventory-management',
        icon: '',
        auth: [authenticationEnum.Inventory_Management],
        breadcrumbs: false
      },
      // {
      //   id: 'salesRequestsDet',
      //   title: 'Sales & Requests',
      //   type: 'item',
      //   classes: 'nav-item',
      //   url: '/pages/supplement-sales-requests',
      //   icon: '',
      //   auth: authenticationEnum.Home_Dashboard,
      //   breadcrumbs: false
      // },
      {
        id: 'browseSupplementsDet',
        title: 'Browse Supplements',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/browse-supplements',
        icon: '',
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
  /* side navigation bar item for Masters */
  {
    id: 'masters',
    title: 'Masters',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Equipments, authenticationEnum.Suppliers, authenticationEnum.Membership_Category],
    children: [
      {
        id: 'equipmentsDet',
        title: 'Equipments',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/equipments',
        icon: '',
        auth: [authenticationEnum.Equipments],
        breadcrumbs: false
      },
      {
        id: 'supplierDet',
        title: 'Suppliers',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/suppliers',
        icon: '',
        auth: [authenticationEnum.Suppliers],
        breadcrumbs: false
      },
      {
        id: 'membershipCategoriesDet',
        title: 'Membership Categories',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/membership-categories',
        icon: '',
        auth: [authenticationEnum.Membership_Category],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Employee_Report, authenticationEnum.Member_Report],
    children: [
      {
        id: 'employeeReport',
        title: 'Employees Report',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/employees-report',
        icon: '',
        auth: [authenticationEnum.Employee_Report],
        breadcrumbs: false
      }, // add other reports to here
      {
        id: 'membersReport',
        title: 'Members Report',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/members-report',
        icon: '',
        auth: [authenticationEnum.Member_Report],
        breadcrumbs: false
      },
      {
        id: 'monthlyAttendance',
        title: 'Monthly Attendance',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/reports/monthly-attendance',
        icon: '',
        auth: [authenticationEnum.Member_Report],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Payments],
    children: [
      {
        id: 'payments',
        title: 'Payments',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/payments',
        icon: '',
        auth: [authenticationEnum.Payments],
        breadcrumbs: false
      } // add other reports to here
    ]
  },
  {
    id: 'ratings',
    title: 'Ratings & Feedback',
    type: 'group',
    icon: 'icon-navigation',
    auth: [authenticationEnum.Ratings_And_Feedback, authenticationEnum.Feedback_History],
    children: [
      {
        id: 'ratingsDet',
        title: 'Ratings & Feedback',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/ratings&feedback',
        icon: '',
        auth: [authenticationEnum.Ratings_And_Feedback],
        breadcrumbs: false
      },
      {
        id: 'allRatingsDet',
        title: 'Feedback History',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/all-feedbacks',
        icon: '',
        auth: [authenticationEnum.Feedback_History],
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'login',
        title: 'Login',
        type: 'item',
        classes: 'nav-item',
        url: '/login',
        icon: 'login',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Register',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'profile',
        target: true,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'utilities',
    title: 'UI Components',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'typography',
        title: 'Typography',
        type: 'item',
        classes: 'nav-item',
        url: '/typography',
        icon: 'font-size'
      },
      {
        id: 'color',
        title: 'Colors',
        type: 'item',
        classes: 'nav-item',
        url: '/color',
        icon: 'bg-colors'
      },
      {
        id: 'tabler',
        title: 'Tabler',
        type: 'item',
        classes: 'nav-item',
        url: 'https://ant.design/components/icon',
        icon: 'ant-design',
        target: true,
        external: true
      }
    ]
  },
  {
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'chrome'
      },
      {
        id: 'document',
        title: 'Document',
        type: 'item',
        classes: 'nav-item',
        url: 'https://codedthemes.gitbook.io/mantis-angular/',
        icon: 'question',
        target: true,
        external: true
      }
    ]
  }
];
