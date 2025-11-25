import { Component, ViewChild } from '@angular/core';
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
export class MemberLoginDialogComponent {
  memberLoginForm: FormGroup;
  memberList: any[] = [];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData;
  isButtonDisabled = false;
  submitted = false;
  selectedImageUrl;
  isFileSelected = false;
  submitDisabled;
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

    //Calling getMemberById when user select the member from the dropdown
    this.memberLoginForm.get('memberId')?.valueChanges.subscribe((selectedId) => {
      if (selectedId) {
        this.getMemberById(selectedId);
      }
    });
  }

  // getMember function
  public getMembers(): void {
    //Call Service to get members
    this.memberLoginService.getMembers().subscribe({
      next: (response: any[]) => {
        console.log('Members: ', response);
        this.memberList = response;
      },
      error: (error) => {
        console.log('Error fetching members:', error);
      }
    });

    this.memberLoginForm.get('firstName').disable();
    this.memberLoginForm.get('lastName').disable();
  }

  //getMemberById function
  public getMemberById(memberId: number): void {
    this.memberLoginService.getMemberById(memberId).subscribe({
      next: (response) => {
        console.log('Selected Member: ', response);
        this.memberLoginForm.patchValue({
          firstName: response.firstName,
          lastName: response.lastName,
          member: memberId
        });
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.memberLoginForm.invalid) {
      return;
    }

    console.log('Clicked');
    console.log(this.memberLoginForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === 'add') {
        this.memberLoginService.serviceCall(this.memberLoginForm.getRawValue()).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Trainer registered successfully!');

            // this.addNotification(response);
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        // Calling editData function to send the request to the backend
        this.memberLoginService.editData(this.selectedData?.id, this.memberLoginForm.getRawValue()).subscribe({
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
    this.populateData();
    this.closeDialog();
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
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.memberLoginForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.memberLoginForm.valid || this.memberLoginForm.pristine;
    });
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
      error: (error: any) => {
        this.messageService.showError('Error occured while getting data!');
      }
    });
  }
}
