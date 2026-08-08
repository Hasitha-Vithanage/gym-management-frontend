import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BookClassService } from 'src/app/services/book-class/book-class.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {

  upcomingBookings: any[] = [];
  pastBookings: any[] = [];
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';

  private readonly dialog = inject(MatDialog);

  constructor(
    private readonly bookClassService: BookClassService,
    private readonly http: HttpService,
    private readonly messageService: MessageServiceService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const userId = +this.http.getUserId();
    if (!userId) {
      this.messageService.showError('Unable to identify your account. Please log in again.');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.bookClassService.getMyBookings(userId).subscribe({
      next: (data: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.upcomingBookings = (data ?? []).filter(b => {
          const d = this.parseDate(b.classDate);
          return d >= today
            && b.bookingStatus === 'CONFIRMED'
            && b.classStatus === 'Scheduled';
        });

        this.pastBookings = (data ?? []).filter(b => {
          const d = this.parseDate(b.classDate);
          return d < today
            || b.bookingStatus === 'CANCELLED'
            || b.classStatus !== 'Scheduled';
        });

        this.isLoading = false;
      },
      error: () => {
        this.messageService.showError('Could not load your bookings. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onCancelBooking(booking: any): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Cancel Booking',
        message: `Are you sure you want to cancel your booking for "${booking.classTitle}" on ${this.formatDate(booking.classDate)}?`
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      const userId = +this.http.getUserId();
      this.bookClassService.cancelBooking(booking.bookingId, userId).subscribe({
        next: () => {
          this.messageService.showSuccess('Booking cancelled successfully.');
          this.loadBookings();
        },
        error: (err) => {
          this.messageService.showError(err ?? 'Failed to cancel the booking. Please try again.');
        }
      });
    });
  }

  goToBookClass(): void {
    this.router.navigate(['/pages/book-class']);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private parseDate(d: any): Date {
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
    return new Date(d);
  }

  formatDate(d: any): string {
    try {
      return this.parseDate(d).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return '—'; }
  }

  formatTime(data: any): string {
    try {
      const arr: number[] = Array.isArray(data) ? data : String(data).split(':').map(Number);
      const [h, m] = arr;
      const date = new Date();
      date.setHours(h, m, 0, 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return '—'; }
  }

  getTypeClass(type: string): string {
    if (!type) return 'default';
    const t = type.toLowerCase();
    if (t.includes('hiit') || t.includes('crossfit') || t.includes('boxing')) return 'hiit';
    if (t.includes('zumba') || t.includes('dance'))                           return 'zumba';
    if (t.includes('yoga') || t.includes('pilates') || t.includes('stretch')) return 'yoga';
    if (t.includes('cycling') || t.includes('spin'))                          return 'cycling';
    return 'default';
  }

  getBookingStatusClass(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'CONFIRMED': return 'confirmed';
      case 'CANCELLED': return 'cancelled';
      default:          return '';
    }
  }

  getClassStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Cancelled': return 'class-cancelled';
      default:          return '';
    }
  }

  canCancel(booking: any): boolean {
    return booking.bookingStatus === 'CONFIRMED' && booking.classStatus === 'Scheduled';
  }
}
