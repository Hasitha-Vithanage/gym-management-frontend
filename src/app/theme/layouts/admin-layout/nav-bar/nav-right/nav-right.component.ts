// angular import
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

// third party

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';
import { HttpService } from 'src/app/services/http.service';
import { CacheService } from 'src/app/services/CacheService';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  @Input() styleSelectorToggle!: boolean;
  @Output() Customize = new EventEmitter();
  windowWidth: number;
  screenFull: boolean = true;

  userName;

  notifications: any[] = [];
  unreadCount = 0;
  showDropdown = false;

  constructor(
    private iconService: IconService,
    private httpService: HttpService,
    private router: Router,
    private cacheService: CacheService,
    private notificationService: NotificationService
  ) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );

    this.userName = this.httpService.getLoginNameFromCache();
  }

  ngOnInit() {
    this.notificationService.getNotifications().subscribe({
      next: (notifications: any[]) => {
        console.log(notifications);
        this.notificationService.addNotificationToBell(notifications);
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
      this.unreadCount = notifications.filter((n) => !n.readStatus).length;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target || !(event.target as Element).closest('.notification-bell')) {
        this.showDropdown = false;
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      if (!notification.readStatus) {
        this.notificationService.markAsRead(notification.id);
      }
    });
  }

  getRelativeTime(notification: any): string {
    const timestamp = notification.timeStamp ? notification.timeStamp : null;
    if (timestamp) {
      const now = new Date();
      const diff = now.getTime() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    }

    return '';
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile'
    },
    {
      icon: 'user',
      title: 'View Profile'
    },
    {
      icon: 'profile',
      title: 'Social Profile'
    },
    {
      icon: 'wallet',
      title: 'Billing'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];

  public logOutUser(): void {
    this.cacheService.clear(this.httpService.getUserId()!);
    this.httpService.removeToken();
    this.router.navigate(['/login']);
  }
}
