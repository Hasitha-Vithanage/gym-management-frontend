import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
// import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private httpService: HttpService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authToken = this.httpService.getAuthToken();
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
    return next.handle(request);
  }
}
