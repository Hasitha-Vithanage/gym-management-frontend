import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { RatingAndFeedbackServiceService } from 'src/app/services/rating-and-feedback/rating-and-feedback-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

const ELEMENT_DATA: any[] = [
  { category: 1, trainer: 'Hydrogen', rating: 1.0079, feedback: 'H', date: 1, username: 'Hydrogen', actions: 1.0079 },
];

@Component({
  selector: 'app-ratings-and-feedback',
  standalone: false,
  templateUrl: './ratings-and-feedback.component.html',
  styleUrl: './ratings-and-feedback.component.scss'
})
export class RatingsAndFeedbackComponent {
  feedbackForm: FormGroup;
  registerButtonLabel = "Submit";
  rating = 0;
  stars = Array(5).fill(0);
  showTrainerField = false;
  mode = "add";
  trainerList: any[] = [];
  submitted = false;
  isDisabled = false;
  selectedData;

  displayedColumns: string[] = ['category', 'trainer', 'rating', 'feedback', 'date', 'username', 'actions'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  readonly dialog = inject(MatDialog);


  constructor(private fb: FormBuilder,
    private http: HttpService,
    private feedbackService: RatingAndFeedbackServiceService,
    private messageService: MessageServiceService,
  ) { }

  ngOnInit(): void {

    const currentDate = new Date().toISOString().substring(0, 10); // format: 'YYYY-MM-DD'

    this.feedbackForm = this.fb.group({
      category: ['', Validators.required],
      trainer: [''],
      rating: [0],
      anonymous: [false],
      feedback: [''],
      date: [],
      username: [{ value: '', }],
    });

    // this.feedbackForm.get('username')?.disable();

    // Disable the date filed
    this.feedbackForm.get('date')?.setValue(currentDate);

    // Show trainer field only when category is 'Trainer'
    this.feedbackForm.get('category').valueChanges.subscribe(value => {
      this.showTrainerField = value === 'Trainer';

      if (this.showTrainerField) {
        this.feedbackForm.get('trainer').setValidators(Validators.required);
      } else {
        this.feedbackForm.get('trainer').clearValidators();
      }
      this.feedbackForm.get('trainer').updateValueAndValidity();
    });

    // Calling handleAnonymousToggle function
    this.feedbackForm.get('anonymous')?.valueChanges.subscribe(() => {
      this.handleAnonymousToggle();
    });

    // this.initForm();
    this.populateData(this.http.getLoginNameFromCache());
    this.handleAnonymousToggle();
    this.getTrainers();
  }

  // Get trainers from the backend
  public getTrainers(): void {
    //Call service
    this.feedbackService.getTrainers().subscribe({
      next: (response: any[]) => {
        console.log("Get trainers response:", response);
        this.trainerList = response;
      },
      error: (error) => {
        console.error("Error fetching trainers:", error);
      }
    })
  }

  // table filter function
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // pagination code
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // implementation of populateData function
  public populateData(username: any): void {

    try {
      this.feedbackService.getDataByUserName(username).subscribe({
        next: (dataList: any[]) => {
          if (dataList.length <= 0) {
            return;
          }

          this.dataSource = new MatTableDataSource(dataList);

          // sorting and pagination
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        // displaying error message
        error: (error) => {
          this.messageService.showError(error);
        }
      });
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  // Handle anonymous toggle
  handleAnonymousToggle(): void {
    const isAnonymous = this.feedbackForm.get('anonymous')?.value;
    const userName = isAnonymous ? 'Anonymous' : this.http.getLoginNameFromCache();
    this.feedbackForm.get('username')?.setValue(userName);
    console.log('Anonymous:', isAnonymous);
    console.log('Username:', userName);
  }

  // Handle star rating
  setRating(value: number): void {
    this.rating = value;
    this.feedbackForm.get('rating').setValue(value);
  }

  /* onsubmit function */
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.feedbackForm.invalid) {
      return;
    }

    console.log("Clicked");
    console.log(this.feedbackForm.value);
    try {
      // check mode (add or edit)
      if (this.mode === "add") {
        this.feedbackService.serviceCall(this.feedbackForm.getRawValue()).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess("Employee added successfully!");
            this.resetForm();
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });

      } else if (this.mode === "edit") {
        // Calling editData function to send the request to the backend
        this.feedbackService.editData(this.selectedData?.id, this.feedbackForm.getRawValue()).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // Displaying success message
            this.messageService.showSuccess("Employee details updated successfully!");
            this.registerButtonLabel = "Submit";
            this.mode = "save";
            this.feedbackForm.get('category')?.enable();
            this.feedbackForm.get('trainer')?.enable();
            this.resetForm();
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
      // this.feedbackForm.disable();
      // this.isDisabled = true;
      this.feedbackForm.reset();
      this.rating = 0;
      this.mode = "add";
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  // Reset function
  resetForm(): void {
    this.registerButtonLabel = "Submit";
    this.mode = "save";
    this.feedbackForm.reset();
    this.rating = 0;
    this.handleAnonymousToggle();

  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  //refresh button function
  public refreshData(): void {
    this.populateData(this.http.getLoginNameFromCache());
  }

  // edit button function
  public editData(data: any): void {
    console.log(new Date(data.date));
    this.feedbackForm.patchValue(data);
    this.registerButtonLabel = "Update";
    this.mode = "edit";
    this.selectedData = data;
    this.feedbackForm.get('category')?.disable();
    this.feedbackForm.get('trainer')?.disable();

    // patching date values after formatting
    this.feedbackForm.patchValue({
      date: new Date(data.date)
    });

  }

  // // delete button function
  // public deleteData(data: any): void {
  //   const id = data.id;
  //   try {
  //     // calling deleteData function to send the delete request to the backend
  //     this.feedbackService.deleteData(id).subscribe({
  //       next: (respone: any) => {
  //         const index = this.dataSource.data.findIndex((element) => element.id === id);

  //         if (index != -1) {
  //           this.dataSource.data.splice(index, 1);
  //         }
  //         this.dataSource = new MatTableDataSource(this.dataSource.data);

  //         // displaying success message
  //         this.messageService.showSuccess("Employee record deleted successfully!");
  //       },
  //       // displaying error message
  //       error: (error) => {
  //         this.messageService.showError(error);
  //       }
  //     });
  //   } catch (error) {
  //     this.messageService.showError(error);
  //   }
  // }

  public deleteData(data: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete this ${data.category} feedback?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = data.id;
        this.feedbackService.deleteData(id).subscribe({
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

}
