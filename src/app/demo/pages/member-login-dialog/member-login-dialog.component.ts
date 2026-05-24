import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MemberLoginServiceService } from 'src/app/services/member-login/member-login-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-member-login-dialog',
  standalone: false,
  templateUrl: './member-login-dialog.component.html',
  styleUrl: './member-login-dialog.component.scss'
})
export class MemberLoginDialogComponent implements OnInit {
  memberLoginForm: FormGroup;
  memberList: any[] = [];
  dataSource: MatTableDataSource<any>;
  showPassword = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  mode = 'add';
  selectedData: any;
  isButtonDisabled = false;
  submitted = false;
  submitDisabled = false;
  isDisabled = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private memberLoginService: MemberLoginServiceService,
    private messageService: MessageServiceService,
    public dialogRef: MatDialogRef<MemberLoginDialogComponent>
  ) {}

  ngOnInit(): void {
    this.memberLoginForm = this.fb.group({
      memberId: [null, Validators.required],
      firstName: [''],
      lastName: [''],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      role: ['MEMBER'],
      userId: [''],
      member: ['']
    });

    this.getMembers();
    this.populateData();

    // Auto-fill first/last name when member is selected
    this.memberLoginForm.get('memberId')?.valueChanges.subscribe((selectedId) => {
      if (selectedId) {
        this.getMemberById(selectedId);
      } else {
        this.memberLoginForm.patchValue({ firstName: '', lastName: '', userName: '' });
      }
    });
  }

  public getMembers(): void {
    this.memberLoginService.getMembers().subscribe({
      next: (response: any[]) => {
        console.log('Members: ', response);
        this.memberList = response;
      },
      error: (error) => {
        console.log('Error fetching members:', error);
      }
    });

    this.memberLoginForm.get('firstName')?.disable();
    this.memberLoginForm.get('lastName')?.disable();
  }

  public getMemberById(memberId: number): void {
    this.memberLoginService.getMemberById(memberId).subscribe({
      next: (response) => {
        console.log('Selected Member: ', response);
        this.memberLoginForm.patchValue({
          firstName: response.firstName,
          lastName: response.lastName,
          userName: response.firstName,
          member: memberId
        });
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.memberLoginForm.invalid) {
      this.messageService.showError('Please fill in all required fields.');
      return;
    }

    try {
      if (this.mode === 'add') {
        this.memberLoginService.serviceCall(this.memberLoginForm.getRawValue()).subscribe({
          next: (response: any) => {
            this.messageService.showSuccess('Member registered successfully!');
            this.dialogRef.close({ action: 'add', data: response });
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        this.memberLoginService
          .editData(this.selectedData?.id, this.memberLoginForm.getRawValue())
          .subscribe({
            next: (response: any) => {
              this.messageService.showSuccess('Record updated successfully!');
              this.dialogRef.close({ action: 'edit', data: response });
            },
            error: (error) => {
              this.messageService.showError(error);
            }
          });
      }
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  onEdit(data: any): void {
    this.memberLoginForm.patchValue({
      memberId: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      password: data.password,
      userId: data.userId
    });
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.memberLoginForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.memberLoginForm.valid || this.memberLoginForm.pristine;
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  public populateData(): void {
    this.memberLoginService.getData().subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.messageService.showError('Error occurred while getting data!');
      }
    });
  }
}