import { Component, OnInit, OnDestroy } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

interface ScanFeedback {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-mark-attendance',
  standalone: false,
  templateUrl: './mark-attendance.component.html',
  styleUrl: './mark-attendance.component.scss'
})
export class MarkAttendanceComponent implements OnInit, OnDestroy {

  // Scanner state
  scannerEnabled = true;
  allowedFormats = [BarcodeFormat.QR_CODE];
  hasCamera: boolean | null = null;
  hasPermission: boolean | null = null;
  scanFeedback: ScanFeedback | null = null;
  isMarkingAttendance = false;
  private lastScanned = '';
  private feedbackTimer: ReturnType<typeof setTimeout>;

  // Manual search
  memberList: any[] = [];
  memberMap: { [memberNo: string]: any } = {};
  filteredMembers: any[] = [];
  searchQuery = '';

  // Today's check-ins
  todayCheckIns: any[] = [];
  checkInCount = 0;

  private pollSub: Subscription;

  constructor(
    private readonly memberService: MemberServiceService,
    private readonly messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadTodayCheckIns();
    this.pollSub = interval(30000).pipe(
      switchMap(() => this.memberService.getTodayAttendance())
    ).subscribe({
      next: (data: any) => { this.todayCheckIns = data; this.checkInCount = data.length; },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    clearTimeout(this.feedbackTimer);
  }

  // ── Scanner events ────────────────────────────────────────────────

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.hasCamera = devices.length > 0;
  }

  onCamerasNotFound(): void {
    this.hasCamera = false;
  }

  onPermissionResponse(granted: boolean): void {
    this.hasPermission = granted;
  }

  onScanSuccess(result: string): void {
    if (result === this.lastScanned || this.isMarkingAttendance) return;
    this.lastScanned = result;

    const parts = result.split('/');
    const memberNo = parts.at(-1);
    if (!memberNo) { this.showFeedback(false, 'Invalid QR code'); return; }

    this.submitAttendance(memberNo);
    setTimeout(() => { this.lastScanned = ''; }, 4000);
  }

  // ── Manual search ─────────────────────────────────────────────────

  onSearchChange(): void {
    const q = this.searchQuery.toLowerCase().trim();
    const active = this.memberList.filter(m => !m.isDeleted);
    if (!q) { this.filteredMembers = active; return; }
    this.filteredMembers = active.filter(m =>
      m.firstName?.toLowerCase().includes(q) ||
      m.lastName?.toLowerCase().includes(q) ||
      m.memberNo?.toLowerCase().includes(q)
    );
  }

  markManual(member: any): void {
    this.submitAttendance(member.memberNo);
    this.searchQuery = '';
    this.filteredMembers = this.memberList.filter((m: any) => !m.isDeleted);
  }

  // ── Core attendance logic ─────────────────────────────────────────

  private submitAttendance(memberNo: string): void {
    this.isMarkingAttendance = true;
    this.memberService.markAttendanceByMemberNo(memberNo).subscribe({
      next: () => {
        this.isMarkingAttendance = false;
        this.showFeedback(true, `${this.getMemberName(memberNo)} checked in!`);
        this.loadTodayCheckIns();
      },
      error: (err) => {
        this.isMarkingAttendance = false;
        const message = typeof err === 'string' ? err : 'Failed to mark attendance';
        this.showFeedback(false, message);
      }
    });
  }

  private loadMembers(): void {
    this.memberService.getData().subscribe({
      next: (data: any) => {
        this.memberList = data;
        this.memberMap = {};
        data.forEach((m: any) => { this.memberMap[m.memberNo] = m; });
        this.filteredMembers = data.filter((m: any) => !m.isDeleted);
      },
      error: () => {}
    });
  }

  private loadTodayCheckIns(): void {
    this.memberService.getTodayAttendance().subscribe({
      next: (data: any) => { this.todayCheckIns = data; this.checkInCount = data.length; },
      error: () => {}
    });
  }

  private showFeedback(success: boolean, message: string): void {
    this.scanFeedback = { success, message };
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => { this.scanFeedback = null; }, 3500);
  }

  // ── Template helpers ──────────────────────────────────────────────

  getMemberName(memberNo: string): string {
    const m = this.memberMap[memberNo];
    return m ? `${m.firstName} ${m.lastName}` : memberNo;
  }

  getMemberInitials(memberNo: string): string {
    const m = this.memberMap[memberNo];
    return m ? `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase() : '?';
  }

  getMemberPhoto(memberNo: string): string | null {
    const m = this.memberMap[memberNo];
    return m?.image ? `data:${m.imageType};base64,${m.image}` : null;
  }

  formatTime(dateTime: string): string {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
