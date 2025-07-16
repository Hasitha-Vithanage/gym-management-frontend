import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MembershipCategoryService } from 'src/app/services/membership-category/membership-category.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { PaymentsService } from 'src/app/services/payments/payments.service';

@Component({
  selector: 'app-payments-dialog',
  standalone: false,
  templateUrl: './payments-dialog.component.html',
  styleUrl: './payments-dialog.component.scss'
})
export class PaymentsDialogComponent {

  paymentForm: FormGroup;
  registerButtonLabel = 'Add Payment';
  mode = 'add';
  selectedData;
  isDisabled = false;
  submitted = false;
  userName;
  dataSource: MatTableDataSource<any>;
  memberList: any[] = [];
  membership: any;
  submitDisabled;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentsDialogComponent>,
    private http: HttpService,
    private assignTrainerService: AssignTrainerServiceService,
    private membershipCategoryService: MembershipCategoryService,
    private paymentsService: PaymentsService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const userName = this.http.getLoginNameFromCache();

    this.paymentForm = new FormGroup({
      member: new FormControl('', [Validators.required]),
      membershipCategory: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
    });

    // Function for get suppliers
    this.getMembers();
  }

  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.paymentForm.invalid) {
      return;
    }

    console.log('Clicked');
    console.log(this.paymentForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        this.paymentsService.serviceCall(this.paymentForm.value).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Payment Added successfully!');

            // this.addNotification(response);
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        // Calling editData function to send the request to the backend
        this.paymentsService.editData(this.selectedData?.id, this.paymentForm.value).subscribe({
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

  // getMember function
  public getMembers(): void {
    //Call Service to get members
    this.assignTrainerService.getMembers().subscribe({
      next: (response: any[]) => {
        console.log("Members: ", response);
        this.memberList = response;
      },
      error: (error) => {
        console.log('Error fetching members:', error);
      }
    });
  }


  onMemberSelected(selectedFirstName: string): void {
    console.log("NAme; ", selectedFirstName);
    
    if (selectedFirstName) {
      this.getMembershipByName(selectedFirstName);
    }
  }

// getting membership based on the member name
public getMembershipByName(member: any): void {
  this.membershipCategoryService.getMembersByFirstName(member).subscribe({
    next: (response: any) => {
      console.log("Membership: ", response);

      this.membership = response;

      const data = Array.isArray(response) ? response[0] : response;

      this.paymentForm.get('membershipCategory')?.setValue(data.membershipCategory);
      this.getFeeByMembershipCategory(data.membershipCategory);
    },
    error: (error) => {
      console.log('Error fetching membership:', error);
    }
  });
}

// getting based on the Category name
public getFeeByMembershipCategory(categoryName: string): void {
  if (!categoryName) {
    this.paymentForm.get('amount')?.setValue('');
    return;
  }
  this.membershipCategoryService.getFeeByCategoryName(categoryName).subscribe({
    next: (response: any) => {
      console.log("fee: ", response);
      const data = Array.isArray(response) ? response[0] : response;
      console.log("fee amount:", data.fee);
      
     this.paymentForm.get('amount')?.setValue(data.fee || 0);
      
    },
    error: (error) => {
      console.log('Error fetching fee:', error);
      this.paymentForm.get('amount')?.setValue('');
    }
  });
}



  // reset button function
  public resetData(): void {
    this.paymentForm.reset();
    this.paymentForm.setErrors = null;
    this.paymentForm.updateValueAndValidity();
    this.paymentForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Assign Trainer';
  }

  onEdit(data: any): void {
    this.paymentForm.patchValue({
      member: data.member,
      membershipCategory: data.membershipCategory,
      amount: data.amount,
      status: data.status,
      paidData: data.paymentDate,
    });
    this.registerButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;
    this.submitDisabled = true;

    this.paymentForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.paymentForm.valid || this.paymentForm.pristine;
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
