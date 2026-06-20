import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewSupplementDialogComponent>,
    private supplementService: SupplementProductService,
    private messageService: MessageServiceService,
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
      tagsRaw:      [''],
      isActive:     [true]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.supplementForm.invalid) return;

    const { tagsRaw, ...rest } = this.supplementForm.value;
    const tags = (tagsRaw as string)
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const payload = { ...rest, tags };

    if (this.mode === 'add') {
      this.supplementService.createProduct(payload).subscribe({
        next: () => {
          this.messageService.showSuccess('Supplement added successfully!');
          this.dialogRef.close({ action: 'add' });
        },
        error: (e) => this.messageService.showError(e?.error?.message ?? e?.message ?? 'Failed to save.')
      });
    } else {
      this.supplementService.updateProduct(this.selectedData.id, payload).subscribe({
        next: () => {
          this.messageService.showSuccess('Supplement updated successfully!');
          this.dialogRef.close({ action: 'edit' });
        },
        error: (e) => this.messageService.showError(e?.error?.message ?? e?.message ?? 'Failed to update.')
      });
    }
  }

  onEdit(data: any): void {
    this.supplementForm.patchValue({
      productName:  data.productName,
      brand:        data.brand ?? '',
      category:     data.category,
      price:        data.price,
      stockQty:     data.stockQty,
      description:  data.description ?? '',
      tagsRaw:      (data.tags ?? []).join(', '),
      isActive:     data.isActive
    });
    this.saveButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
  }

  resetForm(): void {
    this.supplementForm.reset({ stockQty: 0, isActive: true });
    this.submitted = false;
    this.saveButtonLabel = 'Save';
    this.mode = 'add';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
