import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import moment from 'moment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
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
  submitDisabled;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentsDialogComponent>,
    private http: HttpService,
    private assignTrainerService: AssignTrainerServiceService,
    private paymentsService: PaymentsService,
    private messageService: MessageServiceService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {
    this.paymentForm = new FormGroup({
      member: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
      paymentDate: new FormControl('', [Validators.required, this.futureDateValidator]),
      nextPaymentDate: new FormControl('', [Validators.required, this.pastDateValidator]),
    });

    this.getMembers();
  }

  pastDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today ? { futureDate: true } : null;
  }

  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { futureDate: true } : null;
  }

  onSubmit() {
    this.submitted = true;
    if (this.paymentForm.invalid) {
      return;
    }

    try {
      if (this.mode === 'add') {
        this.paymentsService.serviceCall(this.paymentForm.value).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            this.messageService.showSuccess('Payment Added successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        this.paymentsService.editData(this.selectedData?.id, this.paymentForm.value).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);
            this.messageService.showSuccess('Record updated successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
      this.isDisabled = true;
      this.mode = 'add';
    } catch (error) {
      this.messageService.showError(error);
    }
    this.closeDialog();
  }

  public getMembers(): void {
    this.assignTrainerService.getMembers().subscribe({
      next: (response: any[]) => {
        this.memberList = response;
      },
      error: (error) => {
        console.log('Error fetching members:', error);
      }
    });
  }

  public resetData(): void {
    this.paymentForm.reset();
    this.paymentForm.setErrors = null;
    this.paymentForm.updateValueAndValidity();
    this.paymentForm.enable();
    this.isDisabled = false;
    this.submitted = false;
    this.registerButtonLabel = 'Add Payment';
  }

  onEdit(data: any): void {
    this.paymentForm.patchValue({
      member: data.member,
      amount: data.amount,
      status: data.status,
      paymentDate: moment(data.paymentDate).format('YYYY-MM-DD'),
      nextPaymentDate: moment(data.nextPaymentDate).format('YYYY-MM-DD'),
    });

    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.paymentForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.paymentForm.valid || this.paymentForm.pristine;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
