import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MemberLoginServiceService } from 'src/app/services/member-login/member-login-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-member-login',
  standalone: false,
  templateUrl: './member-login.component.html',
  styleUrl: './member-login.component.scss'
})
export class MemberLoginComponent {


  
    memberLoginForm: FormGroup;
    memberList: any[] = [];
    dataSource: MatTableDataSource<any>;
  
  
    constructor(private fb: FormBuilder,
      private router: Router,
      private memberLoginService: MemberLoginServiceService,
      private messageService: MessageServiceService,
    ) { }
  
    ngOnInit(): void {
      this.memberLoginForm = this.fb.group({
        memberId: [null, Validators.required],
        code: ['', Validators.required]
      });
  
      this.getMembers();
    }
  
  // getMember function
  public getMembers(): void {
    //Call Service to get members
    this.memberLoginService.getMembers().subscribe({
      next: (response: any[]) => {
        console.log("Members: ", response);
        this.memberList = response;
      },
      error: (error) => {
        console.log('Error fetching members:', error);
      }
    });
  }
  
    login(): void {
      if (this.memberLoginForm.valid) {
        const loginData = this.memberLoginForm.value;
        console.log('Login Data:', loginData);
        this.memberLoginService.serviceCall(loginData).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess('Member Assigned successfully!');
  
            // this.addNotification(response);
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
    }
}
