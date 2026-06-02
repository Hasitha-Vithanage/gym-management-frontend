import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

  constructor(private toastrService: ToastrService) {}

  showSuccess(message: string, duration: number = 3000): void {
    this.toastrService.success(message, 'Success', { timeOut: duration });
  }

  showError(message: string, duration: number = 8000): void {
    this.toastrService.error(this.safeMessage(message), 'Error', { timeOut: duration });
  }

  showWarning(message: string, duration: number = 5000): void {
    this.toastrService.warning(this.safeMessage(message), 'Warning', { timeOut: duration });
  }

  showInfo(message: string, duration: number = 5000): void {
    this.toastrService.info(this.safeMessage(message), 'Info', { timeOut: duration });
  }

  /** Ensures the toast never shows undefined, [object Object], or raw Java stack traces. */
  private safeMessage(message: any): string {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return 'An unexpected error occurred. Please try again.';
    }
    const technical = ['Exception', 'org.', 'com.bit', 'java.', 'hibernate', 'SQL', 'Request error with:'];
    if (technical.some(p => message.includes(p))) {
      return 'An unexpected error occurred. Please try again.';
    }
    return message.trim();
  }
}
