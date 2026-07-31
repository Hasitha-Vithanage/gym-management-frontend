import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { TrainerRequestService } from 'src/app/services/trainer-request/trainer-request.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { AssignTrainerDialogComponent } from '../assign-trainer-dialog/assign-trainer-dialog.component';
import { RejectRequestDialogComponent } from '../reject-request-dialog/reject-request-dialog.component';

@Component({
  selector: 'app-pending-trainer-requests',
  standalone: false,
  templateUrl: './pending-trainer-requests.component.html',
  styleUrl: './pending-trainer-requests.component.scss'
})
export class PendingTrainerRequestsComponent implements OnInit {

  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['member', 'goal', 'level', 'bmiCategory', 'date', 'actions'];

  readonly dialog = inject(MatDialog);

  constructor(
    private trainerRequestService: TrainerRequestService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.populateData();
  }

  public populateData(): void {
    this.trainerRequestService.getAllRequests().subscribe({
      next: (dataList) => {
        const pending = dataList.filter((r) => r.status === 'PENDING');
        this.dataSource = new MatTableDataSource(pending);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => this.messageService.showError(err)
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  refreshData(): void {
    this.populateData();
  }

  assignTrainer(req: any): void {
    const dialogRef = this.dialog.open(AssignTrainerDialogComponent, {
      autoFocus: false,
      data: {
        preSelectedMemberName: req.memberName,
        lockMember: true,
        pendingTrainerRequestMemberId: req.memberId
      }
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  rejectRequest(req: any): void {
    this.dialog.open(RejectRequestDialogComponent, {
      width: '500px',
      data: {
        memberName: req.memberName,
        goal: this.formatGoal(req.goal),
        level: req.level,
        requestType: 'Trainer'
      }
    }).afterClosed().subscribe((reason: string | null) => {
      if (!reason) return;

      this.trainerRequestService.updateStatus(req.memberId, 'REJECTED').subscribe({
        next: () => {
          this.notificationService.addNotification(
            `Your trainer request has been rejected. ` +
            `Reason: ${reason}. Please resubmit your request or speak with the gym management.`,
            'warning',
            req.memberId
          );
          this.messageService.showSuccess(`Request rejected and ${req.memberName} has been notified.`);
          this.populateData();
        },
        error: (err) => this.messageService.showError(err)
      });
    });
  }

  formatGoal(goal: string): string {
    const map: Record<string, string> = {
      muscle_gain: 'Muscle Gain', fat_loss: 'Fat Loss',
      strength: 'Strength', endurance: 'Endurance',
      general_fitness: 'General Fitness'
    };
    return map[goal] || goal;
  }
}
