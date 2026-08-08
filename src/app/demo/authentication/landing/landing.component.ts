import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CacheService } from 'src/app/services/CacheService';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { MatIcon } from "@angular/material/icon";
import { EmailServiceService } from 'src/app/services/email-service/email-service.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {

  dashboardImages: string[] = [
    'assets/images/landing-page/dashboard_01.png',
    'assets/images/landing-page/dashboard_02.png',
    'assets/images/landing-page/dashboard_03.png'
  ];

  currentImageIndex = 0;
  registerForm: FormGroup;
  submitted = false;

  // Reference to the request form section
  @ViewChild('formSection') formSection!: ElementRef;

  constructor(private router: Router,
    private httpService: HttpService,
    private el: ElementRef,
    private fb: FormBuilder,
    private emailService: EmailServiceService,
    private messageService: MessageServiceService,
  ) { }

  ngOnInit(): void {
    const date = new Date();
    this.registerForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      login: [''],
      email: [''],
      password: [''],
      role: ['Member'],
      status: ['Approval Pending'],
      confirmPassword: [''],
      requestedDate: [date]
    });
    this.startImageLoop();    
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 150); // stagger delay for each card
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const cards = this.el.nativeElement.querySelectorAll('.scroll-animate');
    cards.forEach((card: any) => observer.observe(card));
  }

  // Scroll to the request form when Free Trial button is clicked
  scrollToForm(): void {
    if (this.formSection) {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    if (this.registerForm.value.password === this.registerForm.value.confirmPassword) {
      // Passwords match, proceed with submission
      this.onSubmitRegister();
      this.emailService.sendTrialRequest(this.registerForm.value).subscribe({
        next: (Response: string) => {
          console.log('Trial request sent successfully:', Response);
          this.messageService.showSuccess('Your trial request has been sent successfully!');
          this.registerForm.reset();
        },
        error: (error) => {
          // console.error('Error sending trial request:', error);
          // this.messageService.showSuccess('Your trial request has been sent successfully!');
          this.registerForm.reset();
        }
      })
      // console.log('User Request:', this.registerForm.value);
    }
    else {
      // Passwords do not match, show error message
      this.messageService.showError('Passwords do not match. Please try again.');
    }

  }

  // Handle registration form submission
  onSubmitRegister() {
    this.submitted = true;
    if (this.registerForm?.valid) {
      this.httpService
        .request('POST', '/register', {
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          login: this.registerForm.value.login,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
          role: this.registerForm.value.role,
          status: this.registerForm.value.status,
          requestedDate: this.registerForm.value.requestedDate,
        })
        .then((response: any) => {
          this.httpService.setAuthToken(response.token);
          // this.router.navigate(['/login']);
          this.messageService.showSuccess('Registration successful! Please log in.');
          this.registerForm.reset();
        })
        .catch((error) => {
          this.submitted = false;
        });
    }
  }

  // Navigate to login page
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Image loop for dashboard screenshots
  startImageLoop(): void {
    setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.dashboardImages.length;
    }, 3000); // Change image every 3 seconds
  }

  // Add this method to your LandingPageComponent
  goToImage(index: number): void {
    this.currentImageIndex = index;
  }


}