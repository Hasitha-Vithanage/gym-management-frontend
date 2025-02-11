// Angular import
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem, NavigationItems } from '../navigation';
import { environment } from 'src/environments/environment';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavItemComponent } from './nav-item/nav-item.component';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  DashboardOutline,
  CreditCardOutline,
  LoginOutline,
  QuestionOutline,
  ChromeOutline,
  FontSizeOutline,
  ProfileOutline,
  BgColorsOutline,
  AntDesignOutline
} from '@ant-design/icons-angular/icons';
import { CacheService } from 'src/app/services/CacheService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, CommonModule, RouterModule, NavCollapseComponent, NavGroupComponent, NavItemComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  // public props
  @Output() NavCollapsedMob: EventEmitter<string> = new EventEmitter();

  navigations: NavigationItem[];

  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  // navigation = NavigationItems;
  windowWidth = window.innerWidth;
  private cacheSubscription!: Subscription;
  data!: number[];

  // Constructor
  constructor(
    private location: Location,
    private locationStrategy: LocationStrategy,
    private iconService: IconService,
    private cacheService: CacheService
  ) {
    this.iconService.addIcon(
      ...[
        DashboardOutline,
        CreditCardOutline,
        FontSizeOutline,
        LoginOutline,
        ProfileOutline,
        BgColorsOutline,
        AntDesignOutline,
        ChromeOutline,
        QuestionOutline
      ]
    );

    this.cacheSubscription = this.cacheService.cache$.subscribe((data) => {
      this.data = data;

      this.setAuthStatusInNavItems(this.data);
    });

    // this.navigations = NavigationItems;
  }

  // Life cycle events
  ngOnInit() {
    if (this.windowWidth < 1025) {
      (document.querySelector('.coded-navbar') as HTMLDivElement).classList.add('menupos-static');
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 1025 && document.querySelector('app-navigation.coded-navbar').classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }

  public setEntitlements(navigationArray: NavigationItem[], isAdmin: boolean, privilegeArray?: number[]): void {
    navigationArray.forEach((element) => {
      if (isAdmin) {
        element.isVisible = true;
      } else if (privilegeArray.includes(element.auth)) {
        element.isVisible = true;
      } else {
        element.isVisible = false;
      }

      if (element.children && element.children.length > 0) {
        this.setEntitlements(element.children, isAdmin, privilegeArray);
      }

      if (!element.children || element.children.length === 0) {
        if (isAdmin) {
          element.isVisible = true;
          return;
        } else {
          if (privilegeArray.includes(element.auth)) {
            element.isVisible = true;
          } else {
            element.isVisible = false;
          }
        }

        if (privilegeArray && privilegeArray.length === 0) {
          element.isVisible = false;
        }
        return;
      }
    });
  }

  public setAuthStatusInNavItems(authId: number[]) {
    this.navigations = NavigationItems;
    let isAdmin = false;
    if (authId && authId.length > 0) {
      if (authId.includes(1)) {
        isAdmin = true;
        this.setEntitlements(this.navigations, isAdmin);
        return;
      }

      this.setEntitlements(this.navigations, isAdmin, authId);
    } else if (JSON.parse(window.localStorage.getItem('privileges')!)?.length! > 0) {
      const privilegeArray = JSON.parse(window.localStorage.getItem('privileges')!);
      if (privilegeArray.includes(1)) {
        isAdmin = true;
        this.setEntitlements(this.navigations, isAdmin, privilegeArray);
        return;
      }
      isAdmin = false;
      this.setEntitlements(this.navigations, isAdmin, privilegeArray);
    } else if (authId && authId.length === 0) {
      isAdmin = false;
      this.setEntitlements(this.navigations, isAdmin, authId);
    }

    console.log(this.navigations);
  }
}
