import { Component, OnInit } from '@angular/core';
import { WorkoutSessionService, MemberProgressSummary } from 'src/app/services/workout-session/workout-session.service';

@Component({
  selector: 'app-trainer-member-progress',
  standalone: false,
  templateUrl: './trainer-member-progress.component.html',
  styleUrl: './trainer-member-progress.component.scss'
})
export class TrainerMemberProgressComponent implements OnInit {

  members: MemberProgressSummary[] = [];
  filteredMembers: MemberProgressSummary[] = [];
  isLoading = true;
  searchTerm = '';
  filterStatus = 'ALL';

  readonly statusOptions = [
    { value: 'ALL',        label: 'All Members' },
    { value: 'ACTIVE',     label: 'Active' },
    { value: 'INACTIVE',   label: 'Inactive' },
    { value: 'DROPPED_OFF', label: 'Dropped Off' },
    { value: 'NO_SESSIONS', label: 'No Sessions' }
  ];

  constructor(private readonly sessionService: WorkoutSessionService) {}

  ngOnInit(): void {
    this.loadMembersProgress();
  }

  loadMembersProgress(): void {
    this.isLoading = true;
    this.sessionService.getAllMembersProgress().subscribe({
      next: (data) => {
        this.members = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onStatusFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.members];

    if (this.filterStatus !== 'ALL') {
      result = result.filter(m => m.activityStatus === this.filterStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m =>
        m.programName?.toLowerCase().includes(term) ||
        m.memberName?.toLowerCase().includes(term) ||
        String(m.userId).includes(term)
      );
    }

    this.filteredMembers = result;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      DROPPED_OFF: 'Dropped Off',
      NO_SESSIONS: 'No Sessions'
    };
    return map[status] ?? status;
  }

  getDaysSinceLabel(days: number | null): string {
    if (days === null || days === undefined) return '—';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  get activeCount(): number   { return this.members.filter(m => m.activityStatus === 'ACTIVE').length; }
  get inactiveCount(): number { return this.members.filter(m => m.activityStatus === 'INACTIVE').length; }
  get droppedCount(): number  { return this.members.filter(m => m.activityStatus === 'DROPPED_OFF').length; }
}
