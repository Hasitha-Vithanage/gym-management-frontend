import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddClassService } from 'src/app/services/add-class/add-class.service';
import { BookClassService } from 'src/app/services/book-class/book-class.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-book-class-submit',
  standalone: false,
  templateUrl: './book-class-submit.component.html',
  styleUrl: './book-class-submit.component.scss'
})
export class BookClassSubmitComponent implements OnInit {

  classDetails: any = null;
  memberDetails: any = null;
  isLoadingClass = true;
  isLoadingMember = true;
  isConfirming = false;
  isConfirmed = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly addClassService: AddClassService,
    private readonly bookClassService: BookClassService,
    private readonly memberService: MemberServiceService,
    private readonly http: HttpService,
    private readonly messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    const classId = this.route.snapshot.paramMap.get('id');
    if (classId) {
      this.addClassService.getClassById(+classId).subscribe({
        next: (data) => { this.classDetails = data; this.isLoadingClass = false; },
        error: (err) => {
          this.messageService.showError(err ?? 'Could not load class details. Please try again.');
          this.isLoadingClass = false;
        }
      });
    }

    const userId = Number(this.http.getUserId());
    this.memberService.getMemberProfile(userId).subscribe({
      next: (data) => { this.memberDetails = data; this.isLoadingMember = false; },
      error: () => {
        // Fall back to user data from cache if member profile not available
        this.memberDetails = {
          firstName: this.http.getFullNameFromCache()?.split(' ')[0] ?? '',
          lastName:  this.http.getFullNameFromCache()?.split(' ').slice(1).join(' ') ?? '',
          email: null,
          phoneNumber: null
        };
        this.isLoadingMember = false;
      }
    });
  }

  get isLoading(): boolean {
    return this.isLoadingClass || this.isLoadingMember;
  }

  get isFullyBooked(): boolean {
    return this.classDetails?.remainingSlots <= 0;
  }

  confirmBooking(): void {
    if (this.isConfirming || this.isFullyBooked) return;
    this.isConfirming = true;

    const classId = Number(this.classDetails?.id);
    const userId  = Number(this.http.getUserId());

    this.bookClassService.confirmBooking(classId, userId).subscribe({
      next: () => {
        this.isConfirmed = true;
        this.isConfirming = false;
        this.messageService.showSuccess('Class booked successfully! See you there.');
      },
      error: (err) => {
        this.messageService.showError(err ?? 'Booking failed. Please try again.');
        this.isConfirming = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pages/book-class']);
  }

  goToDashboard(): void {
    this.router.navigate(['/pages/member-dashboard']);
  }

  formatTime(data: any): string {
    try {
      const arr: number[] = Array.isArray(data) ? data : String(data).split(':').map(Number);
      const [h, m, s] = arr;
      const d = new Date();
      d.setHours(h, m, s ?? 0, 0);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '—';
    }
  }
}
