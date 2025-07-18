import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { error } from 'console';
import { HttpService } from 'src/app/services/http.service';
import { MealPlanUploadService } from 'src/app/services/meal-plan-upload/meal-plan-upload.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NutritionAndMealPlansServiceService } from 'src/app/services/nutrition-and-meal-plans/nutrition-and-meal-plans-service.service';

@Component({
  selector: 'app-nutrition-and-meal-plan',
  standalone: false,
  templateUrl: './nutrition-and-meal-plan.component.html',
  styleUrl: './nutrition-and-meal-plan.component.scss'
})
export class NutritionAndMealPlanComponent implements OnInit {

  activeView: 'myPlans' | 'request' | 'predefined' | null = null;
  hasRequestedPlan = false;
  mealPlanRequestForm: FormGroup;
  submissionSuccess = false;
  mode = "add";
  selectedData;
  isDisabled = false;
  submitted = false;
  dataSource: any;
  pdfUrl: SafeResourceUrl | null = null;
  isLoading = true;
  hasPdf = false;

  private rawPdfBlob: Blob | null = null;
  mealPlanLastUpdated: Date | null = null;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private nutritionService: NutritionAndMealPlansServiceService,
    private messageService: MessageServiceService,
    private mealPlanUploadService: MealPlanUploadService,
    private sanitizer: DomSanitizer
  ) {

    const today = new Date().toISOString().split('T')[0];
    const name = this.http.getLoginNameFromCache();

    this.mealPlanRequestForm = this.fb.group({
      userId: [name, Validators.required],
      requestedDate: [today, [Validators.required, Validators.min(10)]],
      fitnessGoal: ['', Validators.required],
      dietaryPreferences: [[]],
      allergies: [''],
      additionalNotes: ['']
    });
    // this.mealPlanRequestForm.get('username')?.disable();
    // this.mealPlanRequestForm.get('requestedDate')?.disable();
  }

  // OnInit function
  ngOnInit(): void {
    // this.checkExistingRequest();
    this.populateData();
  }

  populateData(): void {
    const userId = this.http.getLoginNameFromCache();

    this.mealPlanUploadService.getPdf(userId).subscribe({
      next: (data: Blob) => {
        this.rawPdfBlob = data;
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
        this.hasPdf = true;
        this.isLoading = false;
        this.mealPlanLastUpdated = new Date();

        console.log("response Data: ", data);

      },
      error: (err) => {
        // this.messageService.showError('Meal plan not available for this user.');
        this.isLoading = false;
        this.hasPdf = false;
        this.rawPdfBlob = null;
        this.pdfUrl = null;
      }
    });
  }


  // function for check if the user has already requested a meal plan
  // checkExistingRequest() {
  //   const userId = this.http.getLoginNameFromCache();
  //   this.nutritionService.hasExistingRequest(userId).subscribe({
  //     next: (hasRequest: boolean) => {
  //       this.hasRequestedPlan = hasRequest;
  //       console.log(this.hasRequestedPlan);

  //     },
  //     error: (error) => {
  //       this.messageService.showError("Failed to check meal plan request status");
  //     }
  //   });
  // }


  // myMealPlans
  myMealPlans = [
    {
      title: 'Fat Loss Plan - Week 1',
      date: new Date(),
      trainer: 'Coach Samantha',
      totalCalories: 1800,
      meals: [
        {
          name: 'Breakfast',
          time: '8:00 AM',
          totalCalories: 400,
          items: [
            { name: 'Oats with Banana', quantity: '1 bowl', calories: 250 },
            { name: 'Boiled Eggs', quantity: '2', calories: 150 }
          ]
        },
        {
          name: 'Lunch',
          time: '1:00 PM',
          totalCalories: 600,
          items: [
            { name: 'Grilled Chicken Breast', quantity: '150g', calories: 300 },
            { name: 'Brown Rice', quantity: '1 cup', calories: 200 },
            { name: 'Steamed Veggies', quantity: '1 cup', calories: 100 }
          ]
        },
        {
          name: 'Dinner',
          time: '7:00 PM',
          totalCalories: 500,
          items: [
            { name: 'Vegetable Soup', quantity: '1 bowl', calories: 150 },
            { name: 'Salad with Tofu', quantity: '1 plate', calories: 350 }
          ]
        }
      ]
    }
  ];

  // Predefined meal plans
  predefinedPlans = [
    {
      title: 'Balanced Diet Plan',
      date: new Date(),
      trainer: 'Coach Samantha',
      totalCalories: 2000,
      meals: [
        {
          name: 'Breakfast',
          time: '7:00 AM',
          totalCalories: 325,
          items: [
            { name: 'Oatmeal', quantity: '1 bowl', calories: 150 },
            { name: 'Banana', quantity: '1 medium', calories: 105 },
            { name: 'Almonds', quantity: '10 pcs', calories: 70 }
          ]
        },
        {
          name: 'Lunch',
          time: '12:30 PM',
          totalCalories: 565,
          items: [
            { name: 'Grilled Chicken Breast', quantity: '150g', calories: 250 },
            { name: 'Brown Rice', quantity: '1 cup', calories: 215 },
            { name: 'Steamed Veggies', quantity: '1 cup', calories: 100 }
          ]
        },
        {
          name: 'Dinner',
          time: '7:00 PM',
          totalCalories: 590,
          items: [
            { name: 'Salmon Fillet', quantity: '150g', calories: 280 },
            { name: 'Quinoa', quantity: '1 cup', calories: 220 },
            { name: 'Mixed Salad', quantity: '1 bowl', calories: 90 }
          ]
        }
      ]
    },
    {
      title: 'Low Carb Plan',
      date: new Date(),
      trainer: 'Coach Samantha',
      totalCalories: 1800,
      meals: [
        {
          name: 'Breakfast',
          time: '8:00 AM',
          totalCalories: 330,
          items: [
            { name: 'Scrambled Eggs', quantity: '3 eggs', calories: 210 },
            { name: 'Avocado', quantity: '1/2 fruit', calories: 120 }
          ]
        },
        {
          name: 'Lunch',
          time: '1:00 PM',
          totalCalories: 350,
          items: [
            { name: 'Grilled Turkey', quantity: '150g', calories: 200 },
            { name: 'Steamed Broccoli', quantity: '1 cup', calories: 150 }
          ]
        },
        {
          name: 'Dinner',
          time: '7:30 PM',
          totalCalories: 450,
          items: [
            { name: 'Beef Steak', quantity: '200g', calories: 400 },
            { name: 'Cauliflower Rice', quantity: '1 cup', calories: 50 }
          ]
        }
      ]
    }
  ];

  selectPlan(plan: any) {
    alert(`You selected "${plan.title}"`);
  }

  viewDetails(plan: any) {
    alert(`Details for "${plan.title}"`);
  }


  // Onsubmit function
  onSubmit() {
    this.submitted = true;
    // check if form is valid
    if (this.mealPlanRequestForm.invalid) {
      return;
    }

    console.log("Clicked");
    console.log(this.mealPlanRequestForm.getRawValue());
    try {
      // check mode (add or edit)
      if (this.mode === "add") {
        this.nutritionService.serviceCall(this.mealPlanRequestForm.getRawValue()).subscribe({
          next: (response: any) => {
            if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
              this.dataSource = new MatTableDataSource([response, ...this.dataSource.data]);
            } else {
              this.dataSource = new MatTableDataSource([response]);
            }
            // displaying success message
            this.messageService.showSuccess("Employee added successfully!");
          },
          // Displaying error message
          error: (error) => {
            this.messageService.showError(error);
          }
        });

      } else if (this.mode === "edit") {
        // Calling editData function to send the request to the backend
        this.nutritionService.editData(this.selectedData?.id, this.mealPlanRequestForm.value).subscribe({
          next: (response: any) => {
            let elementIndex = this.dataSource.data.findIndex((element) => element.id === this.selectedData?.id);
            this.dataSource.data[elementIndex] = response;
            this.dataSource = new MatTableDataSource(this.dataSource.data);

            // Displaying success message
            this.messageService.showSuccess("Employee details updated successfully!");
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      }
      this.mealPlanRequestForm.disable();
      this.isDisabled = true;
      this.mode = "add";
    } catch (error) {
      this.messageService.showError(error);
    }
  }

  // form reset button function
  onReset() {
    this.submissionSuccess = false;
    this.mealPlanRequestForm.reset();
  }

  downloadPdf(): void {
    if (!this.rawPdfBlob) return;

    const url = URL.createObjectURL(this.rawPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'WorkoutPlan.pdf';
    link.click();

    URL.revokeObjectURL(url);
  }

}
