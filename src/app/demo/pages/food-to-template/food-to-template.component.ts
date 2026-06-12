import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FoodItemService } from 'src/app/services/food-item/food-item.service';
import { MealPlanTemplateService } from 'src/app/services/meal-plan-template/meal-plan-template.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-food-to-template',
  standalone: false,
  templateUrl: './food-to-template.component.html',
  styleUrl: './food-to-template.component.scss'
})
export class FoodToTemplateComponent implements OnInit {

  mealItemForm!: FormGroup;
  templateData: any;
  foodList: any[] = [];
  assignedItems: any[] = [];
  searchQuery = '';
  selectedFood: any = null;
  calculatedCalories: number | null = null;

  readonly weekDays = [1, 2, 3, 4, 5, 6, 7];
  readonly mealSlots = ['Breakfast', 'MidMorning', 'Lunch', 'EveningSnack', 'Dinner'];

  readonly dialog = inject(MatDialog);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private foodItemService: FoodItemService,
    private templateService: MealPlanTemplateService,
    private messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.templateService.getTemplateById(id).subscribe({
      next: (t) => {
        this.templateData = t;
        this.loadExistingItems(id);
      },
      error: (e) => this.messageService.showError(e.message ?? e)
    });

    this.initForm();
    this.loadFoodItems();
  }

  initForm(): void {
    this.mealItemForm = this.fb.group({
      foodItemId:       ['', Validators.required],
      dayOfWeek:        ['', Validators.required],
      mealSlot:         ['', Validators.required],
      portionGrams:     [100, [Validators.required, Validators.min(1)]],
      caloriesForPortion: [{ value: '', disabled: true }],
      mealOrder:        [1],
      notes:            ['']
    });

    this.mealItemForm.get('portionGrams')!.valueChanges.subscribe(() => this.recalcCalories());
  }

  loadFoodItems(): void {
    this.foodItemService.getAllFoodItems().subscribe({
      next: (items) => { this.foodList = items; },
      error: (e) => this.messageService.showError(e.message ?? e)
    });
  }

  loadExistingItems(templateId: number): void {
    this.templateService.getMealItems(templateId).subscribe({
      next: (items) => { this.assignedItems = items; },
      error: (e) => this.messageService.showError(e.message ?? e)
    });
  }

  filteredFoods(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.foodList;
    return this.foodList.filter(f =>
      f.foodName?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q)
    );
  }

  selectFood(food: any): void {
    this.selectedFood = food;
    this.mealItemForm.patchValue({ foodItemId: food.id });
    this.recalcCalories();
  }

  quickAdd(food: any): void {
    this.selectFood(food);
    this.addItem();
  }

  recalcCalories(): void {
    const grams = this.mealItemForm.get('portionGrams')?.value;
    if (this.selectedFood && grams > 0) {
      this.calculatedCalories = Math.round((grams / 100.0) * this.selectedFood.caloriesPer100g * 10) / 10;
    } else {
      this.calculatedCalories = null;
    }
  }

  addItem(): void {
    if (this.mealItemForm.invalid) {
      this.mealItemForm.markAllAsTouched();
      return;
    }
    if (!this.selectedFood) {
      this.messageService.showError('Please select a food item first.');
      return;
    }

    const { foodItemId, dayOfWeek, mealSlot, portionGrams, mealOrder, notes } = this.mealItemForm.value;
    const caloriesForPortion = this.calculatedCalories ?? 0;

    const isDuplicate = this.assignedItems.some(
      (i) => i.foodItemId == foodItemId && Number(i.dayOfWeek) === Number(dayOfWeek) && i.mealSlot === mealSlot
    );

    if (isDuplicate) {
      this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Duplicate Entry',
          message: `"${this.selectedFood.foodName}" is already in ${mealSlot} on Day ${dayOfWeek}. Add again?`
        }
      }).afterClosed().subscribe((confirmed) => {
        if (confirmed) this.doAdd(foodItemId, dayOfWeek, mealSlot, portionGrams, caloriesForPortion, mealOrder, notes);
      });
    } else {
      this.doAdd(foodItemId, dayOfWeek, mealSlot, portionGrams, caloriesForPortion, mealOrder, notes);
    }
  }

  private doAdd(foodItemId: any, dayOfWeek: any, mealSlot: string, portionGrams: number, caloriesForPortion: number, mealOrder: number, notes: string): void {
    this.assignedItems = [
      ...this.assignedItems,
      {
        templateId: this.templateData?.id,
        foodItemId,
        foodItemName: this.selectedFood.foodName,
        dayOfWeek,
        mealSlot,
        portionGrams,
        caloriesForPortion,
        mealOrder,
        notes
      }
    ];
    this.messageService.showSuccess('Food item added!');
    this.resetForm();
  }

  get usedDays(): number[] {
    return [...new Set(this.assignedItems.map((i) => Number(i.dayOfWeek)))].sort((a, b) => a - b);
  }

  slotsForDay(day: number): string[] {
    const slots = this.mealSlots.filter((s) => this.assignedItems.some((i) => Number(i.dayOfWeek) === day && i.mealSlot === s));
    return slots;
  }

  itemsForDaySlot(day: number, slot: string): any[] {
    return this.assignedItems.filter((i) => Number(i.dayOfWeek) === day && i.mealSlot === slot);
  }

  totalCaloriesForDay(day: number): number {
    return this.assignedItems
      .filter((i) => Number(i.dayOfWeek) === day)
      .reduce((sum, i) => sum + (i.caloriesForPortion ?? 0), 0);
  }

  removeItem(item: any): void {
    this.assignedItems = this.assignedItems.filter((i) => i !== item);
    this.messageService.showSuccess('Item removed.');
  }

  onFoodDropdownChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const food = this.foodList.find((f) => f.id === id);
    if (food) this.selectFood(food);
  }

  resetForm(): void {
    this.selectedFood = null;
    this.calculatedCalories = null;
    this.mealItemForm.reset({ portionGrams: 100, mealOrder: 1 });
  }

  saveAssignments(): void {
    if (this.assignedItems.length === 0) return;
    this.templateService.saveMealItems(this.templateData.id, this.assignedItems).subscribe({
      next: () => {
        this.messageService.showSuccess('Meal plan saved successfully!');
        this.router.navigate(['/pages/meal-plan-templates']);
      },
      error: (e) => this.messageService.showError(e.message ?? e)
    });
  }

  goBack(): void {
    this.router.navigate(['/pages/meal-plan-templates']);
  }

  slotLabel(slot: string): string {
    const labels: { [key: string]: string } = {
      Breakfast: 'Breakfast', MidMorning: 'Mid Morning',
      Lunch: 'Lunch', EveningSnack: 'Evening Snack', Dinner: 'Dinner'
    };
    return labels[slot] ?? slot;
  }
}
