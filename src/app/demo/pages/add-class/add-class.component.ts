import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddClassDialogComponent } from '../add-class-dialog/add-class-dialog.component';
import { AddClassService } from 'src/app/services/add-class/add-class.service';

@Component({
  selector: 'app-add-class',
  standalone: false,
  templateUrl: './add-class.component.html',
  styleUrl: './add-class.component.scss'
})
export class AddClassComponent implements OnInit {

  readonly displayedColumns: string[] = [
    'classTitle',
    'classType',
    'date',
    'startTime',
    'endTime',
    'conductorName',
    'remainingSlots',
    'fee',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly dialog = inject(MatDialog);

  constructor(
    private readonly addClassService: AddClassService,
    private readonly messageService: MessageServiceService,
    private readonly http: HttpService
  ) {}

  ngOnInit(): void {
    this.populateData();
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  populateData(): void {
    this.addClassService.getData().subscribe({
      next: (dataList: any[]) => {
        this.dataSource.data = dataList ?? [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => this.messageService.showError(err)
    });
  }

  refreshData(): void {
    this.populateData();
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  // ── Dialog ────────────────────────────────────────────────────────────────

  openDialog(): void {
    this.dialog.open(AddClassDialogComponent, { autoFocus: false })
      .afterClosed().subscribe(() => this.populateData());
  }

  editData(data: any): void {
    const ref = this.dialog.open(AddClassDialogComponent, { autoFocus: false });
    ref.afterOpened().subscribe(() => ref.componentInstance.onEdit(data));
    ref.afterClosed().subscribe(() => this.populateData());
  }

  deleteData(data: any): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete "${data.classTitle}"?` }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.addClassService.deleteData(data.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(i => i.id !== data.id);
          this.messageService.showSuccess('Class deleted successfully.');
        },
        error: (err) => this.messageService.showError(err)
      });
    });
  }

  // ── Display helpers ───────────────────────────────────────────────────────

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

  getTypeClass(type: string): string {
    if (!type) return 'default';
    const t = type.toLowerCase();
    if (t.includes('hiit') || t.includes('crossfit') || t.includes('boxing')) return 'hiit';
    if (t.includes('zumba') || t.includes('dance'))                           return 'zumba';
    if (t.includes('yoga') || t.includes('pilates') || t.includes('stretch')) return 'yoga';
    if (t.includes('cycling') || t.includes('spin'))                          return 'cycling';
    if (t.includes('body pump') || t.includes('trx') || t.includes('functional')) return 'pilates';
    return 'default';
  }

  getSlotsClass(remaining: number, total: number): string {
    if (!total) return 'ok';
    const pct = remaining / total;
    if (pct <= 0.2) return 'low';
    if (pct <= 0.5) return 'medium';
    return 'ok';
  }

  getSlotsPercent(remaining: number, total: number): number {
    if (!total) return 0;
    return Math.round((remaining / total) * 100);
  }
}
