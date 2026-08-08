import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SupplementProductService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-new-supplement-dialog',
  standalone: false,
  templateUrl: './new-supplement-dialog.component.html',
  styleUrl: './new-supplement-dialog.component.scss'
})
export class NewSupplementDialogComponent implements OnInit {

  supplementForm!: FormGroup;
  saveButtonLabel = 'Save';
  mode = 'add';
  selectedData: any;
  submitted = false;
  selectedImageUrl: SafeUrl | null = null;
  isFileSelected = false;
  selectedTags: string[] = [];

  readonly predefinedTags: string[] = [
    'Vegan', 'Gluten-Free', 'Sugar-Free', 'Lactose-Free', 'Non-GMO', 'Soy-Free', 'Natural', 'Organic',
    'Protein', 'Muscle-Building', 'Recovery', 'Energy', 'Strength', 'Endurance', 'Focus',
    'Pre-Workout', 'Post-Workout', 'Intra-Workout',
    'Weight-Loss', 'Bulking', 'Cutting', 'Unflavored'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewSupplementDialogComponent>,
    private supplementService: SupplementProductService,
    private messageService: MessageServiceService,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.supplementForm = this.fb.group({
      productName:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      brand:        ['', Validators.maxLength(100)],
      category:     ['', Validators.required],
      price:        [null, [Validators.required, Validators.min(0)]],
      stockQty:     [0,   [Validators.required, Validators.min(0)]],
      description:  ['', Validators.maxLength(500)],
      isActive:     [true],
      image:        new FormControl(''),
      imageName:    new FormControl(''),
      imageType:    new FormControl('')
    });
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx === -1) this.selectedTags.push(tag);
    else this.selectedTags.splice(idx, 1);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.selectedImageUrl = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      this.isFileSelected = true;
      this.supplementForm.get('image')!.setValue(file);
    }
  }

  removeImage(): void {
    this.selectedImageUrl = null;
    this.isFileSelected = false;
    this.supplementForm.get('image')!.setValue('');
    this.supplementForm.get('imageName')!.setValue('');
    this.supplementForm.get('imageType')!.setValue('');
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  prepareFormData(): FormData {
    const { image, imageName, imageType, ...rest } = this.supplementForm.getRawValue();
    const fd = new FormData();
    fd.append('productForm', new Blob([JSON.stringify({ ...rest, tags: this.selectedTags })], { type: 'application/json' }));

    if (this.isFileSelected) {
      const file = this.supplementForm.get('image')!.value;
      fd.append('image', file, file.name);
    } else if (image && imageType) {
      const blob = this.base64ToBlob(image, imageType);
      const file = new File([blob], imageName || 'product-image', { type: imageType });
      fd.append('image', file, file.name);
    }

    return fd;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.supplementForm.invalid) return;

    const formData = this.prepareFormData();

    if (this.mode === 'add') {
      this.supplementService.createProduct(formData).subscribe({
        next: () => {
          this.messageService.showSuccess('Supplement added successfully!');
          this.dialogRef.close({ action: 'add' });
        },
        error: (e) => this.messageService.showError(e?.error?.message ?? e?.message ?? 'Failed to save.')
      });
    } else {
      this.supplementService.updateProduct(this.selectedData.id, formData).subscribe({
        next: () => {
          this.messageService.showSuccess('Supplement updated successfully!');
          this.dialogRef.close({ action: 'edit' });
        },
        error: (e) => this.messageService.showError(e?.error?.message ?? e?.message ?? 'Failed to update.')
      });
    }
  }

  onEdit(data: any): void {
    this.selectedTags = [...(data.tags ?? [])];
    this.supplementForm.patchValue({
      productName:  data.productName,
      brand:        data.brand ?? '',
      category:     data.category,
      price:        data.price,
      stockQty:     data.stockQty,
      description:  data.description ?? '',
      isActive:     data.isActive,
      image:        data.image ?? '',
      imageName:    data.imageName ?? '',
      imageType:    data.imageType ?? ''
    });

    if (data.image && data.imageType) {
      this.selectedImageUrl = this.sanitizer.bypassSecurityTrustUrl(
        `data:${data.imageType};base64,${data.image}`
      );
      this.isFileSelected = false;
    }

    this.saveButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
  }

  resetForm(): void {
    this.supplementForm.reset({ stockQty: 0, isActive: true });
    this.selectedTags = [];
    this.selectedImageUrl = null;
    this.isFileSelected = false;
    this.submitted = false;
    this.saveButtonLabel = 'Save';
    this.mode = 'add';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
