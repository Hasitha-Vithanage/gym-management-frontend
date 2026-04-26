import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MembershipCategoryService } from 'src/app/services/membership-category/membership-category.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-membership-categories-dialog',
  standalone: false,
  templateUrl: './membership-categories-dialog.component.html',
  styleUrl: './membership-categories-dialog.component.scss'
})
export class MembershipCategoriesDialogComponent implements OnInit {

   membershipCategoryForm: FormGroup;
  registerButtonLabel = 'Add Category';
  mode: 'add' | 'edit' = 'add';
  selectedData: any = null;
  isDisabled = false;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<MembershipCategoriesDialogComponent>,
    private http: HttpService,
    private membershipCategoryService: MembershipCategoryService,
    private messageService: MessageServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.membershipCategoryForm = new FormGroup({
      categoryName: new FormControl('', [Validators.required]),
      fee: new FormControl('', [Validators.required]),
    });

    // ✅ Populate form if edit mode
    if (this.data) {
      this.onEdit(this.data);
    }
  }

  onEdit(data: any): void {
    this.selectedData = data;
    this.mode = 'edit';
    this.registerButtonLabel = 'Update';

    this.membershipCategoryForm.patchValue({
      categoryName: data.categoryName,
      fee: data.fee,
    });

    // ✅ Mark pristine AFTER patching so dirty-check works correctly
    this.membershipCategoryForm.markAsPristine();
    this.membershipCategoryForm.markAsUntouched();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.membershipCategoryForm.invalid) return;

    const payload = this.membershipCategoryForm.value;

    if (this.mode === 'add') {
      this.membershipCategoryService.serviceCall(payload).subscribe({
        next: (response: any) => {
          this.messageService.showSuccess('Membership Category created successfully!');
          this.dialogRef.close(response); // ✅ Return new record to parent
        },
        error: (err) => this.messageService.showError(err)
      });

    } else {
      this.membershipCategoryService.editData(this.selectedData.id, payload).subscribe({
        next: (response: any) => {
          this.messageService.showSuccess('Record updated successfully!');
          this.dialogRef.close(response); // ✅ Return updated record to parent
        },
        error: (err) => this.messageService.showError(err)
      });
    }
  }

  resetData(): void {
    this.membershipCategoryForm.reset();
    this.membershipCategoryForm.markAsPristine();
    this.membershipCategoryForm.markAsUntouched();
    this.submitted = false;
    this.isDisabled = false;
    this.registerButtonLabel = 'Add Category';
    this.mode = 'add';
    this.selectedData = null;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
