import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FoodItemService } from 'src/app/services/food-item/food-item.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-add-food-item',
  standalone: false,
  templateUrl: './add-food-item.component.html',
  styleUrl: './add-food-item.component.scss'
})
export class AddFoodItemComponent implements OnInit, OnDestroy {

  foodItemForm!: FormGroup;
  registerButtonLabel = 'Save';
  mode = 'add';
  selectedData: any;
  submitted = false;

  private valueChangesSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddFoodItemComponent>,
    private foodItemService: FoodItemService,
    private messageService: MessageServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.foodItemForm = this.fb.group({
      foodName:           ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      category:           ['', Validators.required],
      caloriesPer100g:    [null, [Validators.required, Validators.min(0)]],
      proteinG:           [null, [Validators.required, Validators.min(0)]],
      carbsG:             [null, [Validators.required, Validators.min(0)]],
      fatG:               [null, [Validators.required, Validators.min(0)]],
      servingDescription: ['', Validators.maxLength(200)],
      dietaryTagsRaw:     ['']
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.foodItemForm.invalid) return;

    const { dietaryTagsRaw, ...rest } = this.foodItemForm.value;
    const dietaryTags = (dietaryTagsRaw as string)
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const payload = { ...rest, dietaryTags };

    if (this.mode === 'add') {
      this.foodItemService.createFoodItem(payload).subscribe({
        next: () => {
          this.messageService.showSuccess('Food item added successfully!');
          this.dialogRef.close({ action: 'add' });
        },
        error: (error) => this.messageService.showError(error?.error?.message ?? error?.message ?? 'Something went wrong.')
      });
    } else {
      this.foodItemService.updateFoodItem(this.selectedData.id, payload).subscribe({
        next: () => {
          this.messageService.showSuccess('Food item updated successfully!');
          this.dialogRef.close({ action: 'edit' });
        },
        error: (error) => this.messageService.showError(error?.error?.message ?? error?.message ?? 'Action failed.')
      });
    }
  }

  onEdit(data: any): void {
    this.foodItemForm.patchValue({
      foodName:           data.foodName,
      category:           data.category,
      caloriesPer100g:    data.caloriesPer100g,
      proteinG:           data.proteinG,
      carbsG:             data.carbsG,
      fatG:               data.fatG,
      servingDescription: data.servingDescription ?? '',
      dietaryTagsRaw:     (data.dietaryTags ?? []).join(', ')
    });
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;

    this.valueChangesSub?.unsubscribe();
    this.valueChangesSub = this.foodItemForm.valueChanges.subscribe(() => {});
  }

  resetData(): void {
    this.foodItemForm.reset();
    this.submitted = false;
    this.registerButtonLabel = 'Save';
    this.mode = 'add';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
