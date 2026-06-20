import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { RatingAndFeedbackServiceService } from 'src/app/services/rating-and-feedback/rating-and-feedback-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-all-feedbacks',
  standalone: false,
  templateUrl: './all-feedbacks.component.html',
  styleUrl: './all-feedbacks.component.scss'
})
export class AllFeedbacksComponent {

  displayedColumns: string[] = [
    'category', 'targetName', 'rating', 'feedback',
    'submittedAt', 'submittedBy', 'status', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  stars = Array(5).fill(0);
  analytics: any = null;
  statusFilter = '';
  private textSearch = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly dialog = inject(MatDialog);

  constructor(
    private feedbackService: RatingAndFeedbackServiceService,
    private messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const sep = filter.indexOf('|||');
      const text = sep < 0 ? filter : filter.slice(0, sep);
      const status = sep < 0 ? '' : filter.slice(sep + 3);
      const textOk = !text || JSON.stringify(data).toLowerCase().includes(text);
      const statusOk = !status || data.status === status;
      return textOk && statusOk;
    };
    this.loadData();
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (data: any[]) => { this.dataSource.data = data.map(i => this.normalizeDate(i)); },
      error: (err) => this.messageService.showError(err)
    });
  }

  private normalizeDate(item: any): any {
    const d = item.submittedAt;
    return {
      ...item,
      submittedAt: Array.isArray(d)
        ? new Date(d[0], d[1] - 1, d[2], d[3] ?? 0, d[4] ?? 0, d[5] ?? 0)
        : new Date(d)
    };
  }

  loadAnalytics(): void {
    this.feedbackService.getAnalytics().subscribe({
      next: (data: any) => { this.analytics = data; },
      error: (err) => console.error('Analytics failed', err)
    });
  }

  applyFilter(event: Event): void {
    this.textSearch = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = `${this.textSearch}|||${this.statusFilter}`;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.dataSource.filter = `${this.textSearch}|||${this.statusFilter}`;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  get pendingCount(): number { return this.dataSource.data.filter((e: any) => e.status === 'PENDING').length; }
  get reviewedCount(): number { return this.dataSource.data.filter((e: any) => e.status === 'REVIEWED').length; }
  get resolvedCount(): number { return this.dataSource.data.filter((e: any) => e.status === 'RESOLVED').length; }

  updateStatus(data: any, newStatus: string): void {
    const label = newStatus === 'REVIEWED' ? 'Reviewed' : 'Resolved';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Mark this ${data.category} feedback as "${label}"? This action cannot be undone.` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.feedbackService.updateStatus(data.id, newStatus).subscribe({
        next: (response: any) => {
          this.dataSource.data = this.dataSource.data.map(e => e.id === data.id ? this.normalizeDate(response) : e);
          this.messageService.showSuccess(`Feedback marked as ${label}`);
          this.loadAnalytics();
        },
        error: (err) => this.messageService.showError(err)
      });
    });
  }

  refreshData(): void {
    this.loadData();
    this.loadAnalytics();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'REVIEWED': return 'status-reviewed';
      case 'RESOLVED': return 'status-resolved';
      default: return 'status-pending';
    }
  }

  getDisplayName(element: any): string {
    return element.anonymous ? 'Anonymous' : element.submittedBy;
  }
}
