import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { WorkoutManagementService } from 'src/app/services/workout-management/workout-management.service';
import { HttpService } from 'src/app/services/http.service';
import { RejectRequestDialogComponent } from '../reject-request-dialog/reject-request-dialog.component';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-workout-plan-upload',
  standalone: false,
  templateUrl: './workout-plan-upload.component.html',
  styleUrl: './workout-plan-upload.component.scss'
})
export class WorkoutPlanUploadComponent implements OnInit {

  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['member', 'goal', 'level', 'ageWeight', 'date', 'actions'];

  readonly dialog = inject(MatDialog);

  constructor(
    private workoutService: WorkoutManagementService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.populateData();
  }

  public populateData(): void {
    const trainerUserId = Number(this.http.getUserId());
    if (!trainerUserId) return;

    this.workoutService.getPendingCustomRequestsForTrainer(trainerUserId).subscribe({
      next: (dataList: any[]) => {
        this.dataSource = new MatTableDataSource(dataList);
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

  createAndAssign(req: any): void {
    this.router.navigate(['/pages/workout-templates'], {
      queryParams: {
        pendingRequestId: req.id,
        memberUserId:     req.memberUserId,
        memberName:       req.userId,
        goal:             req.fitnessGoal,
        level:            req.experienceLevel
      }
    });
  }

  rejectRequest(req: any): void {
    this.dialog.open(RejectRequestDialogComponent, {
      width: '500px',
      data: {
        memberName: req.userId,
        goal: this.formatGoal(req.fitnessGoal),
        level: req.experienceLevel
      }
    }).afterClosed().subscribe((reason: string | null) => {
      if (!reason) return;

      // Update request status to Rejected
      this.workoutService.updateStatusByUserId(req.userId, 'Rejected').subscribe({
        next: () => {
          // Notify the member with the rejection reason
          if (req.memberUserId) {
            this.notificationService.addNotification(
              `Your workout plan request has been rejected by your trainer. ` +
              `Reason: ${reason}. Please resubmit your request or speak with the gym management.`,
              'warning',
              req.memberUserId
            );
          }
          this.messageService.showSuccess(`Request rejected and ${req.userId} has been notified.`);
          this.populateData();
        },
        error: (err) => this.messageService.showError(err)
      });
    });
  }

  formatGoal(goal: string): string {
    const map: Record<string, string> = {
      muscle_gain: 'Muscle Gain', fat_loss: 'Fat Loss',
      strength: 'Strength', endurance: 'Endurance'
    };
    return map[goal] || goal;
  }
}
