import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';

const ELEMENT_DATA: any[] = [
  {
    memberNo: 1, firstName: 'Hydrogen', lastName: 1.0079, nic: 'H', dateOfBirth: 1, address: 'Hydrogen', phoneNumber: 1.0079, email: 'H',
    emergencyContactNumber: 1, bloodType: 'Hydrogen', joinedDate: 1.0079, gender: 'H', injuries: 1, membershipCategory: 'Hydrogen'
  },
];
@Component({
  selector: 'app-member-registration',
  standalone: false,
  templateUrl: './member-registration.component.html',
  styleUrl: './member-registration.component.scss'
})
export class MemberRegistrationComponent {

  memberForm: FormGroup;
  registerButtonLabel = "Register"

  displayedColumns: string[] = ['memberNo', 'firstName', 'lastName', 'nic', 'dateOfBirth', 'address', 'phoneNumber', 'email', 'emergencyContactNumber', 'bloodType',
    'joinedDate', 'gender', 'injuries', 'membershipCategory', 'actions'];
  dataSource: MatTableDataSource<any>;

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

  /* OnInit function */
  ngOnInit(): void {
    this.populateData();
  }

  // populateData function implementation
  public populateData(): void {
    this.memberService.getData().subscribe((response: any[]) => {
      console.log("Get data response: ", response);

      this.dataSource = new MatTableDataSource(response)
    })
  }

  /* OnSubmit function */
  onSubmit() {
    console.log("CLicked");
    console.log(this.memberForm.value);

    this.memberService.serviceCall(this.memberForm.value).subscribe((response) => {
      console.log('Service response: ', response);
      this.memberForm.disable();
    });
  }

  // Edit button function
  public editData(data: any): void {
    this.memberForm.patchValue(data);
    this.registerButtonLabel = "Update";

    // patching date values after formatting
    this.memberForm.patchValue({
      dateOfBirth: new Date(data.dateOfBirth),
      joinedDate: new Date(data.joinedDate)
    });
  }

  // Delete button function
  public deleteData(): void {

  }

  // Reset button function
  resetData() {
    this.memberForm.reset();
    this.memberForm.enable();
    this.registerButtonLabel = "Register";
    }
}