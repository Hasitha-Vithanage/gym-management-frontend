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
  auth?: number;
  isVisible?: boolean;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    auth: authenticationEnum.Home,
    children: [
      {
        id: 'default',
        title: 'Default',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        auth: authenticationEnum.Home_Dashboard,
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
    auth: authenticationEnum.Privileges,
    children: [
      {
        id: 'systemPrivileges',
        title: 'System Privileges',
        type: 'item',
        url: '/pages/privileges/system-privileges',
        //icon: 'ti ti-dashboard',
        breadcrumbs: false,
        classes: 'nav-item',
        auth: authenticationEnum.System_Privileges,
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
        // auth: authenticationEnum.Privilege_Groups,
        isVisible: false
      }
    ]
  },
  {
    id: 'formDemo',
    title: 'Form-Demo',
    type: 'group',
    icon: 'icon-navigation',
    auth: authenticationEnum.Home,
    children: [
      {
        id: 'formDemoDet',
        title: 'Form Demo',
        type: 'item',
        classes: 'nav-item',
        url: '/pages/form-demo',
        icon: 'dashboard',
        auth: authenticationEnum.Home_Dashboard,
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
