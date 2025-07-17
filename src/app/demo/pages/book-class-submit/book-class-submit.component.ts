import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AddClassService } from 'src/app/services/add-class/add-class.service';
import { BookClassService } from 'src/app/services/book-class/book-class.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-book-class-submit',
  standalone: false,
  templateUrl: './book-class-submit.component.html',
  styleUrl: './book-class-submit.component.scss'
})
export class BookClassSubmitComponent {

  class: any;
  quantity: number = 1;
  classBookForm!: FormGroup;
  selectedFile: File | null = null;
  isFileSelected = false;

  dataSource: MatTableDataSource<any>;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private addClassService: AddClassService,
    private bookClassService: BookClassService,
    private router: Router,
    private http: HttpService,
    private messageService: MessageServiceService,
  ) {

    // Access quantity passed from product page
    const nav = this.router.getCurrentNavigation();
    this.quantity = nav?.extras?.state?.['quantity'] ?? 1;


  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.addClassService.getClassById(+id).subscribe((data: any) => {
        this.class = data;
      });
    }

    this.classBookForm = this.fb.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      image: new FormControl(''),
      imageName: new FormControl(''),
      imageType: new FormControl('')
    });
  }

  formatTime(data: any[]): string {
    try {
      // Split hours/minutes/seconds
      const time = data.join(':');
      const [hour, minute, second] = time.split(':').map(Number);

      // Create a Date in local time zone (no need to deal with UTC)
      const date = new Date();
      date.setHours(hour, minute, second || 0, 0);  // hour, minute, second, ms

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Time parse error:', e);
      return 'Invalid Time';
    }
  }

  // bookClass(): void {
  //   this.bookClassService.serviceCall(this.prepareFormData()).subscribe({
  //     next: (response) => {
  //       if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
  //         this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
  //       } else {
  //         this.dataSource = new MatTableDataSource([response]);
  //       }
  //       this.messageService.showSuccess('Your class booking request has been submitted successfully. Our team will review your payslip and confirm your booking shortly.');
  //     },
  //     error: (error) => {
  //       this.messageService.showError('Action failed with error: ' + error);
  //     }
  //   });
  // }

 bookClass(): void {
  if (this.classBookForm.invalid || !this.selectedFile) {
    this.messageService.showError('Please complete all required fields and upload your payslip.');
    return;
  }

  const userName = this.http.getLoginNameFromCache();

  // Create FormData
  const formData = new FormData();

  // Append JSON data as Blob
  const bookingData = {
    firstName: this.classBookForm.value.firstName,
    lastName: this.classBookForm.value.lastName,
    email: this.classBookForm.value.email,
    phoneNumber: this.classBookForm.value.phone,
    classId: this.class?.id,
    bookedBy: userName
  };

  formData.append('bookingForm', new Blob([JSON.stringify(bookingData)], { type: 'application/json' }));
  formData.append('payslip', this.selectedFile, this.selectedFile.name);

  this.bookClassService.bookClass(formData).subscribe({
    next: (response) => {
      this.messageService.showSuccess('Class booked successfully!');
      this.router.navigate(['/book-class']);
    },
    error: (error) => {
      this.messageService.showError('Failed to book class: ' + error.message);
    }
  });
}



  // public prepareFormData(): FormData {
  //   const supplementFormData = new FormData();
  //   // demoFormData.append('demoForm', this.demoForm.value);
  //   supplementFormData.append('supplementForm', new Blob([JSON.stringify(this.classBookForm.value)], { type: 'application/json' }));

  //   if (this.isFileSelected) {
  //     supplementFormData.append('image', this.classBookForm.get('image').value, this.classBookForm.get('image').value.name);
  //   } else {
  //     const imageBlob = this.base64ToBlob(this.classBookForm.get('image').value, this.classBookForm.get('imageType').value);
  //     const file = new File([imageBlob], this.classBookForm.get('imageName').value, { type: this.classBookForm.get('imageType').value });
  //     supplementFormData.append('image', file, file.name);
  //   }

  //   return supplementFormData;
  // }

  public prepareFormData(): FormData {
    const formData = new FormData();

    const userName = this.http.getLoginNameFromCache();

    // Form values
    const formValues = this.classBookForm.value;

    // Append form data as JSON Blob
    formData.append(
      'bookingForm',
      new Blob([JSON.stringify(formValues)], { type: 'application/json' })
    );

    // Append class data as JSON Blob
    formData.append(
      'classDetails',
      new Blob([JSON.stringify(this.class)], { type: 'application/json' })
    );

    // Append the user name as a plain field
    formData.append('userName', userName);

    // Append PDF file
    if (this.selectedFile) {
      formData.append('payslip', this.selectedFile, this.selectedFile.name);
    }

    return formData;
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

  backButton(): void {
    window.history.back();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.messageService.showError('Only PDF files are allowed.');
        return;
      }
      this.selectedFile = file;
    }
  }
}
