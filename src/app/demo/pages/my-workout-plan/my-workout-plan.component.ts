import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { WorkoutPlanUploadService } from 'src/app/services/workout-plan-upload/workout-plan-upload.service';

@Component({
  selector: 'app-my-workout-plan',
  standalone: false,
  templateUrl: './my-workout-plan.component.html',
  styleUrl: './my-workout-plan.component.scss'
})
export class MyWorkoutPlanComponent {

  pdfUrl: SafeResourceUrl | null = null;
  isLoading = true;
  hasPdf = false;

  userProfile: {
    photoUrl: string;
    name: string;
    lastWorkoutDate: Date;
  } | null = null;

  userStats: {
    completedWorkouts: number;
    currentGoal: string;
    nextWorkoutDate: Date;
  } | null = null;

  workoutPlanLastUpdated: Date | null = null;

  private rawPdfBlob: Blob | null = null; // store raw blob for download

  constructor(
    private uploadWorkoutService: WorkoutPlanUploadService,
    private messageService: MessageServiceService,
    private httpService: HttpService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // this.loadUserProfile();
    this.populateData();
  }

  // private loadUserProfile(): void {
  //   // Replace this with actual service call or logic to fetch user profile data
  //   const cachedName = this.httpService.getLoginNameFromCache();
  //   this.userProfile = {
  //     photoUrl: 'assets/default-user.png', // fallback or from real user data
  //     name: cachedName || 'User',
  //     lastWorkoutDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago example
  //   };
  // }

  // populateData(): void {
  //   const userId = this.httpService.getLoginNameFromCache();

  //   this.uploadWorkoutService.getPdf(userId).subscribe({
  //     next: (data: Blob) => {
  //       const blob = new Blob([data], { type: 'application/pdf' });
  //       const url = URL.createObjectURL(blob);
  //       this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //       this.rawPdfBlob = blob;

  //       console.log("response Data: ", data);

  //     },
  //     error: (err) => {
  //       this.messageService.showError('Workout plan not available for this user.');
  //       this.isLoading = false;
  //       this.hasPdf = false;
  //       this.rawPdfBlob = null;
  //       this.pdfUrl = null;
  //     }
  //   });
  // }

   populateData(): void {
    const userId = this.httpService.getLoginNameFromCache();

    this.uploadWorkoutService.getPdf(userId).subscribe({
      next: (data: Blob) => {
        this.rawPdfBlob = data;
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
        this.hasPdf = true;
        this.isLoading = false;
        this.workoutPlanLastUpdated = new Date(); // Set to now or get real timestamp if available
        
        console.log("response Data: ", data);
        
      },
      error: (err) => {
        this.messageService.showError('Workout plan not available for this user.');
        this.isLoading = false;
        this.hasPdf = false;
        this.rawPdfBlob = null;
        this.pdfUrl = null;
      }
    });
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

  printPdf(): void {
    if (!this.pdfUrl) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = this.pdfUrl as string;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  }



}
