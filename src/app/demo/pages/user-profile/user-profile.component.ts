import { Component } from '@angular/core';
import { error } from 'console';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  profileImageUrl?: string;
  joinedDate: string;
  membershipType?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {

  userDetails: any;

  user: UserProfile = {
    id: 1,
    firstName: 'Hasitha',
    lastName: 'Vithanage',
    email: 'hasitha@example.com',
    phoneNumber: '0771234567',
    dateOfBirth: '2000-01-15',
    gender: 'Male',
    address: '123 Galle Road, Colombo, Sri Lanka',
    profileImageUrl: 'assets/images/user/avatar-2.jpg',
    joinedDate: '2024-03-10',
    membershipType: 'Premium',
  };

  constructor(
    private userProfileService: UserProfileService,
        private messageService: MessageServiceService,
        private http: HttpService,
        private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
 const userId = this.http.getLoginNameFromCache();
    this.populateData(userId);
  }

  populateData(userId: any): void {

    this.userProfileService.getUserData(userId).subscribe({
      next: (response) => {
        console.log("User Data Response: ", response);
               this.userDetails = response;
      }, error: (error) => {
        this.messageService.showError(error);
      }
    });
  }



}
