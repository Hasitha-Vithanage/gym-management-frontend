import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
@Component({
  selector: 'app-member-registration',
  standalone: false,
  templateUrl: './member-registration.component.html',
  styleUrl: './member-registration.component.scss'
})
export class MemberRegistrationComponent{

  memberForm: FormGroup;

  constructor(private fb: FormBuilder, private memberService: MemberServiceService) {
    this.memberForm = this.fb.group({
      memberNo: new FormControl(""),
      firstName: new FormControl(""),
      lastName: new FormControl(""),
      nic: new FormControl(""),
      dateOfBirth: new FormControl(""),
      address: new FormControl(""),
      phoneNumber: new FormControl(""),
      email: new FormControl(""),
      emergencyContactNumber: new FormControl(""),
      bloodType: new FormControl(""),
      joinedDate: new FormControl(""),
      gender: new FormControl(""),
      injuries: new FormControl(""),
      membershipCategory: new FormControl(""),
    })
  }

  /* OnSubmit function */
  onSubmit() {
    console.log("CLicked");
    console.log(this.memberForm.value);

    this.memberService.serviceCall(this.memberForm.value).subscribe((response) => {
      console.log('Service response: ', response);
    });
    }
}