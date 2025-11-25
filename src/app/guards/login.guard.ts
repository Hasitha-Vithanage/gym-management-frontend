import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { HttpService } from '../services/http.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private httpService: HttpService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const loggedInStatus = this.httpService.isLoggedIn;
    if (loggedInStatus) {
      this.router.navigate(['/authentication/login'], {
        queryParams: { returnUrl: state.url },
      });
      return loggedInStatus;
    }
    return !loggedInStatus;
  }
}
