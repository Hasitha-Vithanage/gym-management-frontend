import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-new-supplement-dialog',
  standalone: false,
  templateUrl: './new-supplement-dialog.component.html',
  styleUrl: './new-supplement-dialog.component.scss'
})
export class NewSupplementDialogComponent {
  supplementForm: FormGroup;
  saveButtonLabel = 'Save';
  mode = 'add';
  selectedData;
  selectedImageUrl;
  isFileSelected = false;
  submitted = false;
  supplierList: any[] = []; // List of suppliers
  selectedFileName: string;
  today = new Date();

  supplementCategories: string[] = [
    'Protein',
    'Pre-Workout',
    'Post-Workout',
    'Vitamins & Minerals',
    'Fat Burners',
    'Creatine',
    'Amino Acids',
    'Weight Gainers',
    'Digestive Health',
    'Hydration & Electrolytes',
    'Accessories',
    'Other'
  ];

  unitList: string[] = [
    'kg',
    'g',
    'mg',
    'lb',
    'oz',
    'L',
    'ml',
    'cm',
    'mm',
    'inch',
    'ft',
    'pcs',
    'servings',
    'tablespoon',
    'teaspoon',
    'cup'
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<any>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewSupplementDialogComponent>,
    private newSupplementService: NewSupplementServiceService,
    private sanitizer: DomSanitizer,
    private messageService: MessageServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // this.supplementForm = this.fb.group({
    //   productName: new FormControl(data?.productName || ''),
    //   brand: new FormControl(data?.brand || ''),
    //   category: new FormControl(data?.category || ''),
    //   costPrice: new FormControl(data?.costPrice || ''),
    //   retailPrice: new FormControl(data?.retailPrice || ''),
    //   quantityInStock: new FormControl(data?.quantityInStock || ''),
    //   expiryDate: new FormControl(data?.expiryDate || ''),
    //   supplier: new FormControl(data?.supplier || ''),
    //   description: new FormControl(data?.description || ''),
    //   image: new FormControl('', [Validators.required]),
    //   imageName: new FormControl(''),
    //   imageType: new FormControl(''),
    // });
  }

  ngOnInit() {
    this.supplementForm = this.fb.group({
      productName: new FormControl(this.data?.productName || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      brand: new FormControl(this.data?.brand || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      category: new FormControl(this.data?.category || '', [Validators.required]),
      quantityPerUnit: new FormControl(this.data?.quantityPerUnit || '', [
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]{1,2})?$/), // allows integers or decimals
        Validators.min(1)
      ]),
      unit: new FormControl(this.data?.unit || '', [Validators.required]),
      costPrice: new FormControl(this.data?.costPrice || '', [
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]{1,2})?$/),
        Validators.min(0)
      ]),
      retailPrice: new FormControl(this.data?.retailPrice || '', [
        Validators.required,
        Validators.pattern(/^[0-9]+([.][0-9]{1,2})?$/),
        Validators.min(0)
      ]),
      quantityInStock: new FormControl(this.data?.quantityInStock || '', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.min(0)
      ]),
      expiryDate: new FormControl(this.data?.expiryDate || '', [
        // Optional: you can also add Validators.required if expiry is mandatory
        this.futureDateValidator
      ]),
      supplier: new FormControl(this.data?.supplier || '', [Validators.required]),
      description: new FormControl(this.data?.description || '', [Validators.maxLength(500)]),
      image: new FormControl(''),
      imageName: new FormControl(''),
      imageType: new FormControl('')
    });

    // Function for get suppliers
    this.getSuppliers();

    // this.supplementForm.get('unit').disable();

    // Setting current user's username as addedBy
    // this.userName = this.http.getLoginNameFromCache();
  }

  futureDateValidator(control: FormControl) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    return selectedDate > today ? null : { invalidDate: true };
  }

  selectedCategory: string = '';
  // Function to handle category change
  onCategoryChange(event: any): void {
    this.selectedCategory = event.value;
    this.supplementForm.get('unit').enable();
  }

  // Close button function
  closeDialog(): void {
    // Close the dialog after clicking close button
    this.dialogRef.close();
  }

  /* OnSubmit function */
  onSubmit() {
    this.submitted = true;

    if (this.supplementForm.invalid) {
      return;
    }

    if (this.mode === 'add') {
      this.supplementForm.patchValue({ status: 'Active' });

      this.newSupplementService.serviceCall(this.prepareFormData()).subscribe({
        next: (response) => {
          if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
            this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
          } else {
            this.dataSource = new MatTableDataSource([response]);
          }
          this.messageService.showSuccess('Supplement added successfully!');
        },
        error: (error) => {
          this.messageService.showError('Action failed with error: ' + error);
        }
      });
    } else if (this.mode === 'edit') {
      this.newSupplementService.editData(this.selectedData?.id, this.prepareFormData()).subscribe({
        next: (response) => {
          const index = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
          this.dataSource.data[index] = response;
          this.dataSource = new MatTableDataSource(this.dataSource.data);

          this.messageService.showSuccess('Member edited successfully!');
        },
        error: (error) => {
          this.messageService.showError('Action failed with error: ' + error);
        }
      });
    }
    this.closeDialog();
  }

  // Edit button function
  public editData(data: any): void {
    this.supplementForm.patchValue(data);
    this.saveButtonLabel = 'Update';
    this.mode = 'edit';

    // saving the current form values
    this.selectedData = data;

    // patching date values after formatting
    this.supplementForm.patchValue({
      dateOfBirth: new Date(data.dateOfBirth),
      joinedDate: new Date(data.joinedDate)
    });
  }

  // getSupplier function
  public getSuppliers(): void {
    //Call Service to get suppliers
    this.newSupplementService.getSuppliers().subscribe({
      next: (response: any[]) => {
        console.log('Suppliers: ', response);
        this.supplierList = response;
      },
      error: (error) => {
        console.log('Error fetching suppliers:', error);
      }
    });
  }

  /* table filter function */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public prepareFormData(): FormData {
    const supplementFormData = new FormData();
    // demoFormData.append('demoForm', this.demoForm.value);
    supplementFormData.append('supplementForm', new Blob([JSON.stringify(this.supplementForm.value)], { type: 'application/json' }));

    if (this.isFileSelected) {
      supplementFormData.append('image', this.supplementForm.get('image').value, this.supplementForm.get('image').value.name);
    } else {
      const imageBlob = this.base64ToBlob(this.supplementForm.get('image').value, this.supplementForm.get('imageType').value);
      const file = new File([imageBlob], this.supplementForm.get('imageName').value, { type: this.supplementForm.get('imageType').value });
      supplementFormData.append('image', file, file.name);
    }

    return supplementFormData;
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
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      this.selectedFileName = input.files[0].name;

      if (event.target.files) {
        const file = event.target.files[0];
        const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
        this.selectedImageUrl = url;
        this.isFileSelected = true;
        this.supplementForm.get('image').setValue(file);
      }
    }
  }

  onEdit(data: any): void {
    this.supplementForm.patchValue({
      productName: data.productName,
      brand: data.brand,
      category: data.category,
      quantityPerUnit: data.quantityPerUnit,
      unit: data.unit,
      costPrice: data.costPrice,
      retailPrice: data.retailPrice,
      quantityInStock: data.quantityInStock,
      expiryDate: data.expiryDate,
      supplier: data.supplier,
      description: data.description,
      image: data.image,
      imageName: data.imageName,
      imageType: data.imageType
    });
    this.saveButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;

    // patching date values after formatting
    this.supplementForm.patchValue({
      expiryDate: new Date(data.expiryDate)
    });
  }
}
