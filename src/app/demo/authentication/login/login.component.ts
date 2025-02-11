// angular import
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CacheService } from 'src/app/services/CacheService';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit {
  // public method
  SignInOptions = [
    {
      image: 'assets/images/authentication/google.svg',
      name: 'Google'
    },
    {
      image: 'assets/images/authentication/twitter.svg',
      name: 'Twitter'
    },
    {
      image: 'assets/images/authentication/facebook.svg',
      name: 'Facebook'
    }
  ];

  loginForm: FormGroup;
  submitted = false;
  userNamePasswordError = false;

  data!: any[];
  private cacheSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    private cacheService: CacheService,
    private _messageService: MessageServiceService
  ) {
    this.loginForm = this.formBuilder.group({
      loginName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.clearCacheIfNotAuthorize();

    this.cacheSubscription = this.cacheService.cache$.subscribe((data) => {
      this.data = data;
    });
  }

  public clearCacheIfNotAuthorize(): void {
    const isTokenExpired = this.httpService.isTokenExpired();
    if (isTokenExpired) {
      console.log('expired');
      this.httpService.clearCache();
    }
  }

  getData(userId: number): void {
    const cachedData = this.cacheService.get(userId.toString());

    // If the data is not in cache, we retrieve it from the server and store it in the cache.
    if (!cachedData) {
      this.httpService
        .getAuthIds(userId)
        .then((data: any) => {
          try {
            if (data.length > 0) {
              this.cacheService.set(userId.toString(), data);
              this.router.navigate(['/dashboard/default']);
            } else {
              this._messageService.showError('User does not have privileges');
            }
          } catch (error) {
            this._messageService.showError('Action Failed');
          }
        })
        .catch((error) => {
          this._messageService.showError('Action Failed');
        });
    }
  }

  get formControl() {
    return this.loginForm?.controls;
  }

  onSubmitLogin(): void {
    this.submitted = true;
    if (this.loginForm?.valid) {
      this.httpService
        .request('POST', '/login', {
          login: this.loginForm.value.loginName,
          password: this.loginForm.value.password
        })
        .then((response) => {
          this.httpService.setAuthToken(response.token);
          this.httpService.setUserId(response.id);
          this.httpService.setLoginNameToCache(response.login);
          this.getData(response.id);
        })
        .catch((error) => {
          this.userNamePasswordError = true;
          this.submitted = false;
        });
    }
  }
}
