import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { error } from 'console';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';

@Component({
  selector: 'app-mark-attendance',
  standalone: false,
  templateUrl: './mark-attendance.component.html',
  styleUrl: './mark-attendance.component.scss'
})
export class MarkAttendanceComponent {

  attendanceForm: FormGroup;
  employeeList: any;
  memberList: any;
  submitted;

  constructor(
    private fb: FormBuilder,
      private employeeService: EmpolyeeServiceService,
      private memberService: MemberServiceService,
      private messageService: MessageServiceService,
  ) {

  }

  ngOnInit(): void {

      const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

    this.attendanceForm = this.fb.group({
      attendanceDate: [formattedToday, Validators.required],
      attendanceType: ['', Validators.required],
      employee: [null],
      member: [null],
      attendanceStatus: ['', Validators.required]
    });

    this.getEmployee();
    this.getMember();
  }

  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { futureDate: true } : null;
  }


    onSubmit() {
      console.log("click");
            this.submitted = true;

      if(this.attendanceForm.invalid) {
        return;
      }

      if(this.attendanceForm.get('attendanceType').value === 'employee') {
        this.employeeService.markAttendance(this.attendanceForm.value).subscribe({
          next: (response) => {
            console.log("Employee attendance marked!");
            this.messageService.showSuccess("Employee attendance marked successfully!")
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.attendanceForm.get('attendanceType').value === 'member') {
        this.memberService.markAttendance(this.attendanceForm.value).subscribe({
          next: (response) => {
            console.log("Member attendance marked!");
            this.messageService.showSuccess("Member attendance marked successfully!")
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
  }



  getEmployee(): void {
    this.employeeService.getData().subscribe({
      next: (response) => {
        console.log("Employee List: ", response);
        this.employeeList = response;
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }

  getMember(): void {
    this.memberService.getData().subscribe({
      next: (response) => {
        console.log("Member List: ", response);
        this.memberList = response;
      },
      error: (error) => {
        this.messageService.showError(error);
      }
    });
  }

  // submitAttendance() {
  //   if (this.attendanceType && this.selectedPersonId && this.attendanceStatus) {
  //     console.log('Submitting Attendance:', {
  //       type: this.attendanceType,
  //       personId: this.selectedPersonId,
  //       status: this.attendanceStatus,
  //       date: this.attendanceDate
  //     });
  //     // Show success or toast here
  //   }
  // }
}
