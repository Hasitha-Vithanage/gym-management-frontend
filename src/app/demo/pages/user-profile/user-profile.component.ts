import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';
import { EmpolyeeServiceService } from 'src/app/services/employee-service/empolyee-service.service';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {

  profileData: any = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  role: string | null = null;
  isEmployee = false;

  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    emergencyContactNumber: ''
  };

  isEditingLogin = false;
  isSavingLogin = false;
  loginForm = {
    userName: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private readonly memberService: MemberServiceService,
    private readonly employeeService: EmpolyeeServiceService,
    private readonly messageService: MessageServiceService,
    private readonly http: HttpService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.http.getUserRole();
    this.isEmployee = this.role !== 'MEMBER';
    this.loginForm.userName = this.http.getLoginNameFromCache() ?? '';
    this.loadProfile();
  }

  private loadProfile(): void {
    const userId = Number(this.http.getUserId());
    const request = this.isEmployee
      ? this.employeeService.getEmployeeProfile(userId)
      : this.memberService.getMemberProfile(userId);

    request.subscribe({
      next: (response) => {
        this.profileData = response;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.showError(`Could not load ${this.isEmployee ? 'employee' : 'member'} profile.`);
        this.isLoading = false;
      }
    });
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────

  startEdit(): void {
    this.editForm = {
      firstName:              this.profileData?.firstName              ?? '',
      lastName:               this.profileData?.lastName               ?? '',
      email:                  this.profileData?.email                  ?? '',
      phoneNumber:            this.profileData?.phoneNumber            ?? '',
      address:                this.profileData?.address                ?? '',
      gender:                 this.profileData?.gender                 ?? '',
      emergencyContactNumber: this.profileData?.emergencyContactNumber ?? ''
    };
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveEdit(): void {
    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim()) {
      this.messageService.showError('First name and last name are required.');
      return;
    }
    this.isSaving = true;
    const userId = Number(this.http.getUserId());
    const request = this.isEmployee
      ? this.employeeService.updateEmployeeProfile(userId, this.editForm)
      : this.memberService.updateMemberProfile(userId, this.editForm);

    request.subscribe({
      next: (updated: any) => {
        this.profileData = updated;
        this.http.setFullNameToCache(updated.firstName ?? '', updated.lastName ?? '');
        this.isEditing = false;
        this.isSaving = false;
        this.messageService.showSuccess('Profile updated successfully.');
      },
      error: () => {
        this.messageService.showError('Failed to update profile. Please try again.');
        this.isSaving = false;
      }
    });
  }

  // ── Login & Security ───────────────────────────────────────────────────────

  startEditLogin(): void {
    this.loginForm = {
      userName: this.http.getLoginNameFromCache() ?? '',
      password: '',
      confirmPassword: ''
    };
    this.isEditingLogin = true;
  }

  cancelEditLogin(): void {
    this.isEditingLogin = false;
  }

  saveLogin(): void {
    if (!this.loginForm.userName.trim()) {
      this.messageService.showError('Username is required.');
      return;
    }
    if (this.loginForm.password && this.loginForm.password.length < 6) {
      this.messageService.showError('New password must be at least 6 characters long.');
      return;
    }
    if (this.loginForm.password !== this.loginForm.confirmPassword) {
      this.messageService.showError('New password and confirmation do not match.');
      return;
    }

    this.isSavingLogin = true;
    const userId = Number(this.http.getUserId());
    this.http.changeLogin(userId, this.loginForm.userName.trim(), this.loginForm.password)
      .then(() => {
        this.http.setLoginNameToCache(this.loginForm.userName.trim());
        this.isEditingLogin = false;
        this.isSavingLogin = false;
        this.messageService.showSuccess('Login details updated successfully.');
      })
      .catch((error) => {
        this.messageService.showError(error);
        this.isSavingLogin = false;
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getImageSrc(): string | null {
    if (this.profileData?.image && this.profileData?.imageType) {
      return `data:${this.profileData.imageType};base64,${this.profileData.image}`;
    }
    return null;
  }

  getInitials(): string {
    const f = this.profileData?.firstName?.[0] ?? '';
    const l = this.profileData?.lastName?.[0]  ?? '';
    return (f + l).toUpperCase() || '?';
  }

  getFullName(): string {
    return `${this.profileData?.firstName ?? ''} ${this.profileData?.lastName ?? ''}`.trim() || '—';
  }

  goBack(): void {
    this.router.navigate([this.role === 'MEMBER' ? '/pages/member-dashboard' : '/dashboard/default']);
  }
}
