import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { PdfExportService } from 'src/app/services/pdf-export/pdf-export.service';

interface AtRiskMember {
  memberNo: string;
  memberName: string;
  lastVisit: string;
  daysInactive: number;
}

@Component({
  selector: 'app-attendance-analytics',
  standalone: false,
  templateUrl: './attendance-analytics.component.html',
  styleUrls: ['./attendance-analytics.component.scss']
})
export class AttendanceAnalyticsComponent implements OnInit, OnDestroy {

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  isLoading = true;
  isPeakLoading = true;
  isAtRiskLoading = true;
  isDownloading = false;

  displayYear: number;
  displayMonth: number;

  todayCount = 0;
  thisMonthTotal = 0;
  lastMonthTotal = 0;
  avgDaily = 0;
  activeDays = 0;
  peakHourLabel = '—';
  peakDayLabel = '—';

  dailyChartOptions: any = null;
  peakChartOptions: any = null;
  dailyChartOptionsLight: any = null;
  peakChartOptionsLight: any = null;

  atRiskMembers: AtRiskMember[] = [];
  readonly atRiskDays = 14;


  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  private readonly destroy$ = new Subject<void>();
  private readonly today = new Date();

  constructor(
    private readonly memberService: MemberServiceService,
    private readonly messageService: MessageServiceService,
    private readonly pdfExportService: PdfExportService
  ) {
    this.displayYear = this.today.getFullYear();
    this.displayMonth = this.today.getMonth() + 1;
  }

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAll(): void {
    this.isLoading = true;
    this.isPeakLoading = true;
    this.isAtRiskLoading = true;

    let lastMonthYear = this.displayYear;
    let lastMonth = this.displayMonth - 1;
    if (lastMonth === 0) { lastMonth = 12; lastMonthYear--; }

    forkJoin({
      today: this.memberService.getTodayAttendance(),
      thisMonth: this.memberService.getDailyCheckIns(this.displayYear, this.displayMonth),
      lastMonth: this.memberService.getDailyCheckIns(lastMonthYear, lastMonth),
      peakHours: this.memberService.getPeakHours(),
      atRisk: this.memberService.getAtRiskMembers(this.atRiskDays)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.todayCount = (results.today as any[]).length;
          this.processThisMonth(results.thisMonth);
          this.lastMonthTotal = results.lastMonth.reduce((s: number, r: any) => s + Number(r.visits), 0);
          this.processPeakHours(results.peakHours);
          this.processAtRisk(results.atRisk);
          // thisWeek: this.memberService.getThisWeekCheckIns() 
          this.isLoading = false;
          this.isPeakLoading = false;
          this.isAtRiskLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.isPeakLoading = false;
          this.isAtRiskLoading = false;
        }
      });
  }

  loadDailyChart(): void {
    this.isLoading = true;
    this.memberService.getDailyCheckIns(this.displayYear, this.displayMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.processThisMonth(data);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  prevMonth(): void {
    if (this.displayMonth === 1) { this.displayMonth = 12; this.displayYear--; }
    else { this.displayMonth--; }
    this.loadDailyChart();
  }

  nextMonth(): void {
    if (this.isCurrentMonth) return;
    if (this.displayMonth === 12) { this.displayMonth = 1; this.displayYear++; }
    else { this.displayMonth++; }
    this.loadDailyChart();
  }

  get isCurrentMonth(): boolean {
    return this.displayYear === this.today.getFullYear() &&
           this.displayMonth === this.today.getMonth() + 1;
  }

  private processThisMonth(data: any[]): void {
    const daysInMonth = new Date(this.displayYear, this.displayMonth, 0).getDate();
    const countMap = new Map<number, number>();
    data.forEach(r => countMap.set(Number(r.day), Number(r.visits)));

    const days: number[] = [];
    const counts: number[] = [];
    let maxCount = 0;
    let peakDay = 0;
    let activeDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
      const c = countMap.get(d) ?? 0;
      counts.push(c);
      if (c > maxCount) { maxCount = c; peakDay = d; }
      if (c > 0) activeDays++;
    }

    this.thisMonthTotal = counts.reduce((s, v) => s + v, 0);
    const now = new Date();
    const isViewing = this.displayYear === now.getFullYear() && this.displayMonth === now.getMonth() + 1;
    const elapsed = isViewing ? now.getDate() : daysInMonth;
    this.avgDaily = elapsed > 0 ? Math.round(this.thisMonthTotal / elapsed) : 0;
    this.activeDays = activeDays;
    this.peakDayLabel = peakDay > 0 ? `${this.monthNames[this.displayMonth - 1].slice(0, 3)} ${peakDay}` : '—';

    this.dailyChartOptions = this.buildDailyChartOptions(days, counts, false);
    this.dailyChartOptionsLight = this.buildDailyChartOptions(days, counts, true);
  }

  private buildDailyChartOptions(days: number[], counts: number[], light: boolean): any {
    const textColor = light ? '#6b7280' : '#9CA3AF';
    const lineColor = light ? '#e5e7eb' : '#374151';

    return {
      series: [{ name: 'Check-ins', data: counts }],
      chart: {
        type: 'bar',
        height: 290,
        toolbar: { show: false },
        background: light ? '#ffffff' : 'transparent',
        foreColor: textColor
      },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '70%' } },
      colors: ['#FF6B00'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: days,
        labels: { style: { colors: textColor, fontSize: '11px' } },
        axisBorder: { color: lineColor },
        axisTicks: { color: lineColor }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: { style: { colors: textColor, fontSize: '12px' } }
      },
      grid: { borderColor: lineColor, strokeDashArray: 4 },
      tooltip: {
        theme: light ? 'light' : 'dark',
        y: { formatter: (val: number) => `${val} check-in${val !== 1 ? 's' : ''}` }
      }
    };
  }

  private processPeakHours(data: any[]): void {
    const countMap = new Map<number, number>();
    data.forEach(r => countMap.set(Number(r.hour), Number(r.visits)));

    let maxCount = 0;
    let peakHour = -1;
    const labels: string[] = [];
    const counts: number[] = [];

    for (let h = 4; h <= 22; h++) {
      labels.push(this.formatHour(h));
      const c = countMap.get(h) ?? 0;
      counts.push(c);
      if (c > maxCount) { maxCount = c; peakHour = h; }
    }

    this.peakHourLabel = peakHour >= 0 && maxCount > 0 ? this.formatHour(peakHour) : '—';

    this.peakChartOptions = this.buildPeakChartOptions(labels, counts, false);
    this.peakChartOptionsLight = this.buildPeakChartOptions(labels, counts, true);
  }

  private buildPeakChartOptions(labels: string[], counts: number[], light: boolean): any {
    const textColor = light ? '#6b7280' : '#9CA3AF';
    const lineColor = light ? '#e5e7eb' : '#374151';

    return {
      series: [{ name: 'Check-ins', data: counts }],
      chart: {
        type: 'bar',
        height: 260,
        toolbar: { show: false },
        background: light ? '#ffffff' : 'transparent',
        foreColor: textColor
      },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
      colors: ['#3B82F6'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: labels,
        labels: { style: { colors: textColor, fontSize: '10px' }, rotate: -45 },
        axisBorder: { color: lineColor },
        axisTicks: { color: lineColor }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: { style: { colors: textColor, fontSize: '12px' } }
      },
      grid: { borderColor: lineColor, strokeDashArray: 4 },
      tooltip: {
        theme: light ? 'light' : 'dark',
        y: { formatter: (val: number) => `${val} check-in${val !== 1 ? 's' : ''}` }
      }
    };
  }

  private processAtRisk(data: any[]): void {
    const today = new Date();
    this.atRiskMembers = data.map(r => {
      const raw = r.last_visit;
      let lastDate: Date;

      if (Array.isArray(raw)) {
        lastDate = new Date(raw[0], raw[1] - 1, raw[2]);
      } else if (typeof raw === 'number') {
        // Raw epoch-millis, as returned by this native-query result (unlike the
        // [year, month, day] array shape used by other endpoints in this app).
        lastDate = new Date(raw);
      } else {
        const [y, m, d] = String(raw).split('T')[0].split('-').map(Number);
        lastDate = new Date(y, m - 1, d);
      }

      const dateStr = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
      const daysInactive = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);

      return {
        memberNo: String(r.member_no),
        memberName: r.member_name ? String(r.member_name).trim() : 'Unknown',
        lastVisit: dateStr,
        daysInactive
      };
    });
  }

  formatHour(h: number): string {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  async downloadReport(): Promise<void> {
    const element = this.pdfContent?.nativeElement;
    if (!element || this.isDownloading) return;

    this.isDownloading = true;
    try {
      const dateStamp = `${this.displayYear}-${String(this.displayMonth).padStart(2, '0')}`;
      await this.pdfExportService.downloadElementAsPdf(element, `attendance-analytics-${dateStamp}.pdf`, '#ffffff');
      this.messageService.showSuccess('Report downloaded successfully!');
    } catch (error) {
      this.messageService.showError('Failed to generate report PDF');
      console.error(error);
    } finally {
      this.isDownloading = false;
    }
  }
}
