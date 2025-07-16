import { Component, Inject } from '@angular/core';
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
export class MembershipCategoriesDialogComponent {

  membershipCategoryForm: FormGroup;
  registerButtonLabel = 'Add Category';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  dataSource: MatTableDataSource<any>;
  memberList: any[] = [];
  trainerList: any[] = [];
  submitDisabled;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MembershipCategoriesDialogComponent>,
    private http: HttpService,
    private membershipCategoryService: MembershipCategoryService,
    private messageService: MessageServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const userName = this.http.getLoginNameFromCache();

    this.membershipCategoryForm = new FormGroup({
      categoryName: new FormControl('', [Validators.required]),
      fee: new FormControl('', [Validators.required]),
    });

  }

  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.membershipCategoryForm.invalid) {
      return;
    }

    console.log('Clicked');
    console.log(this.membershipCategoryForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        this.membershipCategoryService.serviceCall(this.membershipCategoryForm.value).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Membership Category created successfully!');

            // this.addNotification(response);
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        // Calling editData function to send the request to the backend
        this.membershipCategoryService.editData(this.selectedData?.id, this.membershipCategoryForm.value).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // Displaying success message
            this.messageService.showSuccess('Record updated successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
      // this.employeeForm.disable();
      this.isDisabled = true;
      this.mode = 'add';
    } catch (error) {
      this.messageService.showError(error);
    }
    this.closeDialog();
  }

  // reset button function
  public resetData(): void {
    this.membershipCategoryForm.reset();
    this.membershipCategoryForm.setErrors = null;
    this.membershipCategoryForm.updateValueAndValidity();
    this.membershipCategoryForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Add Category';
  }

  onEdit(data: any): void {
    this.membershipCategoryForm.patchValue({
      categoryName: data.categoryName,
      fee: data.fee,
    });
    this.registerButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;
    this.submitDisabled = true;

    this.membershipCategoryForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.membershipCategoryForm.valid || this.membershipCategoryForm.pristine;
    });
  }

  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }

  // public addNotification(details: any): void {
  //   this.notificationService.addNotification('Trainer Assigned Successfully', 'success', 1);
  // }
}
