import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { PaymentsService } from 'src/app/services/payments/payments.service';
import { QrCodeComponent } from '../qr-container/qr-code/qr-code.component';

interface JourneyStep {
  step: number;
  title: string;
  description: string;
  route: string;
  emoji: string;
  accentColor: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-member-dashboard',
  standalone: false,
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit, OnDestroy {

  memberName = '';
  greeting = '';
  memberDetails: any = null;
  paymentDetails: any = null;
  isLoading = true;

  readonly journeySteps: JourneyStep[] = [
    {
      step: 1,
      title: 'Complete Your Profile',
      description: 'Add your personal details, contact info, and profile photo so your trainer knows you.',
      route: '/pages/user-profile',
      emoji: '👤',
      accentColor: '#3B82F6'
    },
    {
      step: 2,
      title: 'View Your Workout Plan',
      description: 'Your trainer has prepared a personalized workout plan. Check what exercises are waiting for you.',
      route: '/pages/my-workout-plan',
      emoji: '💪',
      accentColor: '#FF6B00'
    },
    {
      step: 3,
      title: 'Book a Fitness Class',
      description: 'Join group classes like Yoga, HIIT, or Zumba. Pick a time that suits your schedule.',
      route: '/pages/book-class',
      emoji: '🏋️',
      accentColor: '#22C55E'
    },
    {
      step: 4,
      title: 'Track Your Progress',
      description: 'Log your weight, measurements, and body stats. See how far you have come over time.',
      route: '/pages/progress-tracking',
      emoji: '📈',
      accentColor: '#A78BFA'
    },
    {
      step: 5,
      title: 'Set Your Calorie Goals',
      description: 'Calculate your daily calorie target based on your fitness goals — lose weight, build muscle, or maintain.',
      route: '/pages/goal-based-calorie-target',
      emoji: '🥗',
      accentColor: '#FBBF24'
    },
    {
      step: 6,
      title: 'Explore Supplements',
      description: 'Browse our in-house supplement store. Find proteins, vitamins, and more to support your journey.',
      route: '/pages/browse-supplements',
      emoji: '🧃',
      accentColor: '#EF4444'
    }
  ];

  readonly quickActions: QuickAction[] = [
    { label: 'Book a Class',      icon: 'event-orange',    route: '/pages/book-class' },
    { label: 'My Workout',        icon: 'fitness-center',  route: '/pages/my-workout-plan' },
    { label: 'Track Progress',    icon: 'trending-up',     route: '/pages/progress-tracking' },
    { label: 'My Meal Plan',      icon: 'restaurant-menu', route: '/pages/nutrition&meal-plan' },
    { label: 'My Attendance',     icon: 'calendar_month',  route: '/pages/my-attendance' },
    { label: 'Leave Feedback',    icon: 'star_rate',       route: '/pages/ratings&feedback' },
    { label: 'Buy Supplements',   icon: 'shopping_bag',    route: '/pages/browse-supplements' }
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly httpService: HttpService,
    private readonly memberService: MemberServiceService,
    private readonly paymentsService: PaymentsService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.greeting = this.buildGreeting();
    this.memberName = this.httpService.getFullNameFromCache() || 'Member';
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  private loadDashboardData(): void {
    const userId = Number(this.httpService.getUserId());

    forkJoin({
      member: this.memberService.getMemberProfile(userId),
      payments: this.paymentsService.getData()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.memberDetails = results.member;
          const allPayments = results.payments as any[];
          this.paymentDetails = allPayments?.find(
            (p) => p.member === userId || p.memberId === userId
          ) || (allPayments?.length ? allPayments[allPayments.length - 1] : null);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  getPaymentStatus(): string {
    return this.paymentDetails?.paymentStatus || '—';
  }

  getPaymentStatusClass(): string {
    const s = (this.paymentDetails?.paymentStatus || '').toLowerCase();
    if (s === 'paid' || s === 'active') return 'success';
    if (s === 'pending')                return 'warning';
    return 'danger';
  }

  getNextPaymentDate(): string {
    return this.paymentDetails?.nextPaymentDate || '—';
  }

  getDaysUntilPayment(): number | null {
    const raw = this.paymentDetails?.nextPaymentDate;
    if (!raw) return null;
    const diff = new Date(raw).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  showMyQrCode(): void {
    if (!this.memberDetails) return;
    this.dialog.open(QrCodeComponent, {
      data: { value: this.memberDetails },
      panelClass: 'qr-dialog'
    });
  }
}
