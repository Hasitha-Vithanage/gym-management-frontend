import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly httpService: HttpService, private readonly router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if (error?.status === 401) {
          this.httpService.logOut();
          this.router.navigate(['/login']);
          return throwError(() => 'Your session has expired. Please log in again.');
        }
        return throwError(() => this.resolveUserMessage(error));
      })
    );
  }

  private resolveUserMessage(error: any): string {
    const backendMessage: string | undefined = error?.error?.message;

    // Use the backend message when it is clean and user-facing.
    if (backendMessage && typeof backendMessage === 'string' && !this.isTechnical(backendMessage)) {
      return backendMessage.trim();
    }

    // Map HTTP status codes to clear, user-friendly messages.
    switch (error?.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return backendMessage ?? 'This action conflicts with an existing record. Please review and try again.';
      case 422:
        return 'The submitted data is invalid. Please review and correct the errors.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 503:
        return 'The service is temporarily unavailable. Please try again in a few moments.';
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /** Returns true when the message contains Java/technical stack-trace fragments. */
  private isTechnical(message: string): boolean {
    const patterns = ['Exception', 'org.', 'com.bit', 'java.', 'hibernate', 'SQL', 'Request error with:'];
    return patterns.some(p => message.includes(p));
  }
}
