import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { EquipmentManagementService } from 'src/app/services/equipment-management/equipment-management.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LogMaintenanceDialogComponent } from '../log-maintenance-dialog/log-maintenance-dialog.component';

@Component({
  selector: 'app-equipment-management',
  standalone: false,
  templateUrl: './equipment-management.component.html',
  styleUrls: ['./equipment-management.component.scss']
})
export class EquipmentManagementComponent implements OnInit {

  displayedColumns = ['machineName', 'category', 'brandName', 'status', 'lastMaintenance', 'nextMaintenance', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  summary: any = { total: 0, active: 0, maintenance: 0, outOfService: 0, overdue: 0 };
  statusFilter = '';
  private textSearch = '';
  today = new Date();

  readonly statuses = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'];
  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private equipmentService: EquipmentManagementService,
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
    this.loadAll();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAll(): void {
    forkJoin({
      equipment: this.equipmentService.getAllEquipment(),
      summary: this.equipmentService.getStatusSummary()
    }).subscribe({
      next: ({ equipment, summary }) => {
        this.dataSource.data = equipment;
        this.summary = summary;
      },
      error: (err) => this.messageService.showError(err)
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

  get activeCount(): number { return this.dataSource.data.filter((e: any) => e.status === 'ACTIVE').length; }
  get maintenanceCount(): number { return this.dataSource.data.filter((e: any) => e.status === 'MAINTENANCE').length; }
  get outOfServiceCount(): number { return this.dataSource.data.filter((e: any) => e.status === 'OUT_OF_SERVICE').length; }

  isOverdue(nextMaintenance: string): boolean {
    if (!nextMaintenance) return false;
    return new Date(nextMaintenance) < this.today;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'MAINTENANCE': return 'status-maintenance';
      case 'OUT_OF_SERVICE': return 'status-out';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'MAINTENANCE': return 'Maintenance';
      case 'OUT_OF_SERVICE': return 'Out of Service';
      default: return status;
    }
  }

  changeStatus(equipment: any, newStatus: string): void {
    if (equipment.status === newStatus) return;
    const label = this.getStatusLabel(newStatus);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { message: `Mark "${equipment.machineName || equipment.equipmentName}" as ${label}?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.equipmentService.updateStatus(equipment.id, newStatus).subscribe({
        next: (updated) => {
          this.dataSource.data = this.dataSource.data.map((e: any) => e.id === equipment.id ? updated : e);
          this.refreshSummary();
          this.messageService.showSuccess(`Status updated to ${label}`);
        },
        error: (err) => this.messageService.showError(err)
      });
    });
  }

  openMaintenanceLog(equipment: any): void {
    const dialogRef = this.dialog.open(LogMaintenanceDialogComponent, {
      width: '620px',
      data: { equipment }
    });
    dialogRef.afterClosed().subscribe(saved => {
      if (saved) {
        this.dataSource.data = this.dataSource.data.map((e: any) => e.id === equipment.id ? saved : e);
        this.refreshSummary();
      }
    });
  }

  private refreshSummary(): void {
    this.equipmentService.getStatusSummary().subscribe({
      next: (s) => (this.summary = s),
      error: () => {}
    });
  }

  refreshData(): void { this.loadAll(); }
}
