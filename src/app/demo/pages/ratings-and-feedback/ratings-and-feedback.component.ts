import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { RatingAndFeedbackServiceService } from 'src/app/services/rating-and-feedback/rating-and-feedback-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-ratings-and-feedback',
  standalone: false,
  templateUrl: './ratings-and-feedback.component.html',
  styleUrl: './ratings-and-feedback.component.scss'
})
export class RatingsAndFeedbackComponent {

  feedbackForm: FormGroup;
  submitLabel = 'Submit';
  rating = 0;
  hoverRating = 0;
  stars = Array(5).fill(0);
  showTrainerField = false;
  mode = 'add';
  trainerList: any[] = [];
  submitted = false;
  selectedData: any = null;

  displayedColumns: string[] = ['category', 'targetName', 'rating', 'feedback', 'submittedAt', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private feedbackService: RatingAndFeedbackServiceService,
    private messageService: MessageServiceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.feedbackForm = this.fb.group({
      category: ['', Validators.required],
      targetName: [''],
      rating: [0],
      anonymous: [false],
      feedback: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.feedbackForm.get('category')!.valueChanges.subscribe(value => {
      this.showTrainerField = value === 'Trainer';
      const targetCtrl = this.feedbackForm.get('targetName')!;
      if (this.showTrainerField) {
        targetCtrl.setValidators(Validators.required);
      } else {
        targetCtrl.clearValidators();
        targetCtrl.setValue('');
      }
      targetCtrl.updateValueAndValidity();
    });

    this.loadTrainers();
    this.loadMyFeedbacks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTrainers(): void {
    this.feedbackService.getTrainers().subscribe({
      next: (response: any[]) => { this.trainerList = response; },
      error: (err) => console.error('Failed to load trainers', err)
    });
  }

  loadMyFeedbacks(): void {
    const username = this.http.getLoginNameFromCache();
    this.feedbackService.getMyFeedbacks(username).subscribe({
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

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  get ratingLabel(): string {
    return ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][this.hoverRating || this.rating] || '';
  }

  setCategory(value: string): void {
    if (this.mode === 'edit') return;
    this.feedbackForm.get('category')!.setValue(value);
  }

  setRating(value: number): void {
    this.rating = value;
    this.feedbackForm.get('rating')!.setValue(value);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.feedbackForm.invalid || this.rating < 1) return;

    const formValue = this.feedbackForm.getRawValue();
    const payload = {
      ...formValue,
      submittedBy: this.http.getLoginNameFromCache()
    };

    if (this.mode === 'add') {
      this.feedbackService.submitFeedback(payload).subscribe({
        next: (response: any) => {
          this.dataSource.data = [this.normalizeDate(response), ...this.dataSource.data];
          this.messageService.showSuccess('Feedback submitted successfully!');
          this.resetForm();
        },
        error: (err) => this.messageService.showError(err)
      });
    } else {
      this.feedbackService.updateFeedback(this.selectedData.id, payload).subscribe({
        next: (response: any) => {
          const updated = this.dataSource.data.map(e => e.id === this.selectedData.id ? this.normalizeDate(response) : e);
          this.dataSource.data = updated;
          this.messageService.showSuccess('Feedback updated successfully!');
          this.resetForm();
        },
        error: (err) => this.messageService.showError(err)
      });
    }
  }

  editData(data: any): void {
    if (data.status !== 'PENDING') return;
    this.feedbackForm.patchValue({
      category: data.category,
      targetName: data.targetName,
      rating: data.rating,
      anonymous: data.anonymous,
      feedback: data.feedback
    });
    this.rating = data.rating;
    this.showTrainerField = data.category === 'Trainer';
    this.submitLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.feedbackForm.get('category')!.disable();
    this.feedbackForm.get('targetName')!.disable();
    window.setTimeout(() => document.querySelector<HTMLElement>('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  resetForm(): void {
    this.feedbackForm.reset({ category: '', targetName: '', rating: 0, anonymous: false, feedback: '' });
    this.feedbackForm.get('category')!.enable();
    this.feedbackForm.get('targetName')!.enable();
    this.rating = 0;
    this.hoverRating = 0;
    this.submitLabel = 'Submit';
    this.mode = 'add';
    this.submitted = false;
    this.selectedData = null;
    this.showTrainerField = false;
  }

  refreshData(): void {
    this.loadMyFeedbacks();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'REVIEWED': return 'status-reviewed';
      case 'RESOLVED': return 'status-resolved';
      default: return 'status-pending';
    }
  }
}
