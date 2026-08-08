import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';

interface CalendarDay {
  day: number | null;
  dateStr: string | null;
  attended: boolean;
  checkInTime: string | null;
  isToday: boolean;
  isFuture: boolean;
}

@Component({
  selector: 'app-my-attendance',
  standalone: false,
  templateUrl: './my-attendance.component.html',
  styleUrls: ['./my-attendance.component.scss']
})
export class MyAttendanceComponent implements OnInit, OnDestroy {

  isLoading = true;
  memberNo = '';

  displayYear: number;
  displayMonth: number;

  attendedDates = new Map<string, string>(); // date → formatted check-in time
  calendarWeeks: CalendarDay[][] = [];

  visitsThisMonth = 0;
  lastVisit: string | null = null;

  chartOptions: any = null;

  readonly dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  private readonly destroy$ = new Subject<void>();
  private readonly todayStr: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly memberService: MemberServiceService
  ) {
    const now = new Date();
    this.displayYear = now.getFullYear();
    this.displayMonth = now.getMonth() + 1;
    this.todayStr = this.toDateStr(now);
  }

  ngOnInit(): void {
    const userId = Number(this.httpService.getUserId());
    this.memberService.getMemberProfile(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member: any) => {
          this.memberNo = member.memberNo;
          this.loadHistory();
        },
        error: () => { this.isLoading = false; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.memberService.getAttendanceHistory(this.memberNo, this.displayYear, this.displayMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (records) => {
          this.processRecords(records);
          this.buildCalendar();
          this.buildChart();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  prevMonth(): void {
    if (this.displayMonth === 1) {
      this.displayMonth = 12;
      this.displayYear--;
    } else {
      this.displayMonth--;
    }
    this.loadHistory();
  }

  nextMonth(): void {
    if (this.isCurrentMonth) return;
    if (this.displayMonth === 12) {
      this.displayMonth = 1;
      this.displayYear++;
    } else {
      this.displayMonth++;
    }
    this.loadHistory();
  }

  get isCurrentMonth(): boolean {
    const now = new Date();
    return this.displayYear === now.getFullYear() && this.displayMonth === now.getMonth() + 1;
  }

  formatLastVisit(): string {
    if (!this.lastVisit) return 'No visits yet';
    const [y, m, d] = this.lastVisit.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'long', day: 'numeric'
    });
  }

  private processRecords(records: any[]): void {
    this.attendedDates.clear();
    records.forEach(r => {
      const d = r.attendanceDate;
      // LocalDate can arrive as [y,m,d] array or 'YYYY-MM-DD' string
      const dateStr = Array.isArray(d)
        ? `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`
        : String(d);

      // LocalDateTime can arrive as [y,m,d,h,min,s] array or 'YYYY-MM-DDTHH:mm:ss' string
      const t = r.checkInTime;
      let timeStr = '';
      if (Array.isArray(t) && t.length >= 5) {
        const h = t[3] as number;
        const min = t[4] as number;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        timeStr = `${h12}:${String(min).padStart(2, '0')} ${ampm}`;
      } else if (typeof t === 'string' && t.includes('T')) {
        const [, timePart] = t.split('T');
        const [hStr, mStr] = timePart.split(':');
        const h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        timeStr = `${h12}:${mStr} ${ampm}`;
      }

      this.attendedDates.set(dateStr, timeStr);
    });
    this.visitsThisMonth = this.attendedDates.size;
    const sorted = Array.from(this.attendedDates.keys()).sort().reverse();
    this.lastVisit = sorted[0] ?? null;
  }

  private buildCalendar(): void {
    const firstDow = new Date(this.displayYear, this.displayMonth - 1, 1).getDay();
    const daysInMonth = new Date(this.displayYear, this.displayMonth, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, '0');

    const cells: CalendarDay[] = [];

    for (let i = 0; i < firstDow; i++) {
      cells.push({ day: null, dateStr: null, attended: false, checkInTime: null, isToday: false, isFuture: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.displayYear}-${pad(this.displayMonth)}-${pad(d)}`;
      cells.push({
        day: d,
        dateStr,
        attended: this.attendedDates.has(dateStr),
        checkInTime: this.attendedDates.get(dateStr) ?? null,
        isToday: dateStr === this.todayStr,
        isFuture: dateStr > this.todayStr
      });
    }

    this.calendarWeeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      this.calendarWeeks.push(cells.slice(i, i + 7));
    }
  }

  private buildChart(): void {
    const weekCounts: number[] = [];
    const firstDow = new Date(this.displayYear, this.displayMonth - 1, 1).getDay();
    const daysInMonth = new Date(this.displayYear, this.displayMonth, 0).getDate();
    const totalWeeks = Math.ceil((firstDow + daysInMonth) / 7);

    for (let w = 0; w < totalWeeks; w++) {
      weekCounts.push(0);
    }

    this.attendedDates.forEach((_time, dateStr) => {
      const day = parseInt(dateStr.split('-')[2], 10);
      const weekIndex = Math.floor((firstDow + day - 1) / 7);
      weekCounts[weekIndex]++;
    });

    const labels = weekCounts.map((_, i) => `Week ${i + 1}`);

    this.chartOptions = {
      series: [{ name: 'Visits', data: weekCounts }],
      chart: {
        type: 'bar',
        height: 190,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#9CA3AF'
      },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
      colors: ['#FF6B00'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: labels,
        labels: { style: { colors: '#9CA3AF', fontSize: '12px' } },
        axisBorder: { color: '#374151' },
        axisTicks: { color: '#374151' }
      },
      yaxis: {
        min: 0,
        tickAmount: 3,
        labels: { style: { colors: '#9CA3AF', fontSize: '12px' } }
      },
      grid: { borderColor: '#374151', strokeDashArray: 4 },
      tooltip: { theme: 'dark' }
    };
  }

  private toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
