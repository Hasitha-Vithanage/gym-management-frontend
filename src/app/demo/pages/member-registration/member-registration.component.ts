import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  registerButtonLabel = "Register";
  mode = "add";
  selectedData;
  isButtonDisabled = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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

  /* table filter function */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /* Refresh table function */
  refreshData(): void {
    this.populateData();
  }

  // populateData function implementation
  public populateData(): void {
    this.memberService.getData().subscribe((response: any[]) => {
      console.log("Get data response: ", response);

      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  /* OnSubmit function */
  onSubmit() {
    console.log("CLicked");
    console.log(this.memberForm.value);

    if (this.mode === "add") {
      this.memberService.serviceCall(this.memberForm.value).subscribe((response) => {
        // Adds the new data to the beginning table
        if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
          this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
        } else {
          this.dataSource = new MatTableDataSource([response]);
        }
      });
    } else if (this.mode === "edit") {
      this.memberService.editData(this.selectedData?.id, this.memberForm.value).subscribe((response) => {
        let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
        this.dataSource.data[elementIndex] = response;
        this.dataSource = new MatTableDataSource(this.dataSource.data);
      })
    }
    this.mode = "add";
    this.memberForm.disable();
    this.isButtonDisabled = true;
  }

  // Edit button function
  public editData(data: any): void {
    this.memberForm.patchValue(data);
    this.registerButtonLabel = "Update";
    this.mode = "edit";

    // saving the current form values
    this.selectedData = data;

    // patching date values after formatting
    this.memberForm.patchValue({
      dateOfBirth: new Date(data.dateOfBirth),
      joinedDate: new Date(data.joinedDate)
    });
  }

  // Delete button function
  public deleteData(data: any): void {
    const id = data.id;
    this.memberService.deleteData(id).subscribe((response) => {
      const index = this.dataSource.data.findIndex((element) => element.id === id);

      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
      }
      this.dataSource = new MatTableDataSource(this.dataSource.data);
    });
  }

  // Reset button function
  resetData() {
    this.memberForm.reset();
    this.memberForm.enable();
    this.registerButtonLabel = "Register";
    this.mode = "add";
    this.isButtonDisabled = false;
  }
}