import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { MemberServiceService } from 'src/app/services/member-service/member-service.service';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {

  memberData: any = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;

  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    emergencyContactNumber: ''
  };

  constructor(
    private readonly memberService: MemberServiceService,
    private readonly messageService: MessageServiceService,
    private readonly http: HttpService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const userId = Number(this.http.getUserId());
    this.memberService.getMemberProfile(userId).subscribe({
      next: (response) => {
        this.memberData = response;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.showError('Could not load member profile.');
        this.isLoading = false;
      }
    });
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────

  startEdit(): void {
    this.editForm = {
      firstName:              this.memberData?.firstName              ?? '',
      lastName:               this.memberData?.lastName               ?? '',
      email:                  this.memberData?.email                  ?? '',
      phoneNumber:            this.memberData?.phoneNumber            ?? '',
      address:                this.memberData?.address                ?? '',
      gender:                 this.memberData?.gender                 ?? '',
      emergencyContactNumber: this.memberData?.emergencyContactNumber ?? ''
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
    this.memberService.updateMemberProfile(userId, this.editForm).subscribe({
      next: (updated: any) => {
        this.memberData = updated;
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  getImageSrc(): string | null {
    if (this.memberData?.image && this.memberData?.imageType) {
      return `data:${this.memberData.imageType};base64,${this.memberData.image}`;
    }
    return null;
  }

  getInitials(): string {
    const f = this.memberData?.firstName?.[0] ?? '';
    const l = this.memberData?.lastName?.[0]  ?? '';
    return (f + l).toUpperCase() || '?';
  }

  getFullName(): string {
    return `${this.memberData?.firstName ?? ''} ${this.memberData?.lastName ?? ''}`.trim() || '—';
  }

  getMembershipClass(): string {
    const cat = (this.memberData?.membershipCategory ?? '').toLowerCase();
    if (cat.includes('gold'))     return 'gold';
    if (cat.includes('silver'))   return 'silver';
    if (cat.includes('platinum')) return 'platinum';
    return 'basic';
  }

  goBack(): void {
    const role = this.http.getUserRole();
    this.router.navigate([role === 'MEMBER' ? '/pages/member-dashboard' : '/dashboard/default']);
  }
}
