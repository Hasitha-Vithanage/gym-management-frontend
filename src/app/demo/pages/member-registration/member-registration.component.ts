import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NewMemberDialogComponent } from '../new-member-dialog/new-member-dialog.component';
import { QrCodeComponent } from '../qr-container/qr-code/qr-code.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
  submitted = false;
  selectedImageUrl;
  isFileSelected = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] = ['memberNo', 'firstName', 'lastName', 'nic', 'dateOfBirth', 'address', 'phoneNumber', 'email', 'emergencyContactNumber', 'bloodType',
    'joinedDate', 'gender', 'injuries', 'membershipCategory', 'actions'];
  dataSource: MatTableDataSource<any>;

  constructor(private fb: FormBuilder,
    private memberService: MemberServiceService,
    private sanitizer: DomSanitizer,
    private messageService: MessageServiceService,
    private cdr: ChangeDetectorRef,
  ) {
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
      image: new FormControl('', [Validators.required]),
      imageName: new FormControl(''),
      imageType: new FormControl(''),
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
    });
  }

  // Dialog Box
  readonly dialog = inject(MatDialog);
  openMemberDialog(): void {
    const dialogRef = this.dialog.open(NewMemberDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  /* OnSubmit function */

  editData(data: any): void {
    const dialogRef = this.dialog.open(NewMemberDialogComponent, {
      autoFocus: false,
    });

    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.onEdit(data);
    });

    dialogRef.afterClosed().subscribe(() => this.populateData());
  }

  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${data.firstName} ${data.lastName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.memberService.deleteData(id).subscribe({
          next: () => {
            const index = this.dataSource.data.findIndex(item => item.id === id);
            if (index !== -1) {
              this.dataSource.data.splice(index, 1);
            }
            this.dataSource = new MatTableDataSource(this.dataSource.data);
            this.messageService.showSuccess('Record deleted successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
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



  public prepareFormData(): FormData {
    const memberFormData = new FormData();
    // demoFormData.append('demoForm', this.demoForm.value);
    memberFormData.append('memberForm', new Blob([JSON.stringify(this.memberForm.value)], { type: 'application/json' }));

    if (this.isFileSelected) {
      memberFormData.append('image', this.memberForm.get('image').value, this.memberForm.get('image').value.name);
    } else {
      const imageBlob = this.base64ToBlob(this.memberForm.get('image').value, this.memberForm.get('imageType').value);
      const file = new File([imageBlob], this.memberForm.get('imageName').value, { type: this.memberForm.get('imageType').value });
      memberFormData.append('image', file, file.name);
    }

    return memberFormData;
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  public onFileSelected(event): void {
    if (event.target.files) {
      const file = event.target.files[0];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this.selectedImageUrl = url;
      this.isFileSelected = true;
      this.memberForm.get('image').setValue(file);
    }
  }

  public viewId(data: any) {
    console.log(data);

    this.dialog.open(QrCodeComponent, {
      data: { value: data }
    });
  }
}