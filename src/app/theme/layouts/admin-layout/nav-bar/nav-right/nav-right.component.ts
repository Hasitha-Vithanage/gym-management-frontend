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
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';

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
  userData;
  userId;
  memberData: any;



  notifications: any[] = [];
  unreadCount = 0;
  showDropdown = false;

  constructor(
    private iconService: IconService,
    private httpService: HttpService,
    private router: Router,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private employeeService: EmpolyeeServiceService,
    private memberService: MemberServiceService,
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
    this.userId = this.httpService.getUserId();
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
      const currentUserId = this.httpService.getUserId();

      const currentUserNotifications = notifications.filter((noti: any) => noti.targetUser == currentUserId);

      this.notifications = currentUserNotifications;
      this.unreadCount = currentUserNotifications.filter((n) => !n.readStatus).length;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target || !(event.target as Element).closest('.notification-bell')) {
        this.showDropdown = false;
      }
    });


    this.memberService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.userData = response;
        console.log("UserData", this.userData);

        // Fetch the current user's own profile data (member or employee) so the
        // avatar dropdown can show their name/photo either way.
        if (this.userData.role === 'MEMBER') {
          const memberId = this.userData.customerLoginId;
          this.memberService.getMemberById(memberId).subscribe({
            next: (memberResponse) => {
              this.memberData = memberResponse;
              console.log("MemberData", this.memberData);

              // Build imageSrc if image exists
              if (this.memberData.image && this.memberData.imageType) {
                this.memberData.imageSrc = `data:${this.memberData.imageType};base64,${this.memberData.image}`;
              } else {
                this.memberData.imageSrc = 'assets/images/user/avatar-2.jpg'; // fallback
              }
            },
            error: (error) => {
              console.error("Error fetching member data:", error);
            }
          });
        } else {
          this.employeeService.getEmployeeProfile(this.userId).subscribe({
            next: (employeeResponse: any) => {
              this.memberData = employeeResponse;
              console.log("EmployeeData", this.memberData);

              // Build imageSrc if image exists
              if (this.memberData.image && this.memberData.imageType) {
                this.memberData.imageSrc = `data:${this.memberData.imageType};base64,${this.memberData.image}`;
              } else {
                this.memberData.imageSrc = 'assets/images/user/avatar-2.jpg'; // fallback
              }
            },
            error: (error) => {
              console.error("Error fetching employee data:", error);
            }
          });
        }
      },
      error: (error) => {
        console.error("Error fetching user data:", error);
      }
    });
  }

  // populateData(userId: number) {
  //   this.employeeService.getUserById(userId).subscribe({
  //     next: (response) => {
  //       this.userData = response;
  //       console.log("UserData", this.userData);

  //     }
  //   });
  // }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  onNotificationClick(notification: any) {
    this.markAsRead(notification.id);
    this.showDropdown = false;

    if (
      notification.other &&
      typeof notification.other === 'string' &&
      notification.message?.includes('requested a trainer assignment')
    ) {
      this.router.navigate(['/pages/assign-trainer'], {
        queryParams: { memberName: notification.other }
      });
    }
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      if (!notification.readStatus) {
        this.notificationService.markAsRead(notification.id);
      }
    });
  }

  clearNotification(id: any, event: Event) {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  clearAllNotifications() {
    this.notificationService.clearAllNotifications();
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
    // {
    //   icon: 'edit',
    //   title: 'Edit Profile'
    // },
    // {
    //   icon: 'user',
    //   title: 'View Profile'
    // }
    // {
    //   icon: 'profile',
    //   title: 'Social Profile'
    // },
    // {
    //   icon: 'wallet',
    //   title: 'Billing'
    // }
  ];

  setting = [
    // {
    //   icon: 'question-circle',
    //   title: 'Support'
    // },
    // {
    //   icon: 'user',
    //   title: 'Account Settings'
    // },
    // {
    //   icon: 'lock',
    //   title: 'Privacy Center'
    // },
    // {
    //   icon: 'comment',
    //   title: 'Feedback'
    // },
    // {
    //   icon: 'unordered-list',
    //   title: 'History'
    // }
  ];

  public logOutUser(): void {
    this.cacheService.clear(this.httpService.getUserId()!);
    this.httpService.removeToken();
    this.router.navigate(['/login']);
  }

  public viewProfile(): void {
    this.router.navigate(['/pages/user-profile']);
  }
}
