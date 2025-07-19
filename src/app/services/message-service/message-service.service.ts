import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {
  toasts: { message: string; duration: number; type: 'success' | 'error' }[] = [];

  constructor(private toastrService: ToastrService) {}

  showSuccess(message: string, duration: number = 3000) {
    this.toastrService.success('Scucess!', message, {
      timeOut: duration
    });
  }

  showError(message: string, duration: number = 8000) {
    this.toastrService.error(this.extractUserMessage(message), 'Major Error', {
      timeOut: duration
    });
  }

  extractUserMessage(fullMessage: string): string {
    // Extract text after last colon (':')
    const lastColonIndex = fullMessage.lastIndexOf(':');
    return lastColonIndex !== -1 ? fullMessage.substring(lastColonIndex + 1).trim() : fullMessage;
  }
}
