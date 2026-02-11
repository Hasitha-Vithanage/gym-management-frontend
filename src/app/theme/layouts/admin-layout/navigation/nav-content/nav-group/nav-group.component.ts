// Angular import
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

// project import
import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavCollapseComponent } from '../nav-collapse/nav-collapse.component';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { NavigationStateService } from 'src/app/services/navigation-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-group',
  imports: [CommonModule, SharedModule, NavCollapseComponent, NavItemComponent],
  templateUrl: './nav-group.component.html',
  styleUrls: ['./nav-group.component.scss']
})
export class NavGroupComponent implements OnInit, OnDestroy {
  // public props

  // All Version in Group Name
  @Input() item!: NavigationItem;
  @Input() isFirst: boolean = false;
  isExpanded: boolean = false;
  private stateSubscription: Subscription | null = null;

  // Constructor
  constructor(
    private location: Location,
    private navigationStateService: NavigationStateService
  ) { }

  // Life cycle events
  ngOnInit() {
    // Subscribe to navigation state changes
    this.stateSubscription = this.navigationStateService.expandedGroupId$.subscribe((expandedId) => {
      this.isExpanded = expandedId === this.item.id;
    });

    // at reload time active and trigger link
    let current_url = this.location.path();
    // eslint-disable-next-line
    // @ts-ignore
    if (this.location['_baseHref']) {
      // eslint-disable-next-line
      // @ts-ignore
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const pre_parent = up_parent?.parentElement;
      const last_parent = up_parent?.parentElement?.parentElement?.parentElement?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (pre_parent?.classList.contains('coded-hasmenu')) {
        pre_parent.classList.add('coded-trigger');
        pre_parent.classList.add('active');
      }

      if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        if (pre_parent?.classList.contains('coded-hasmenu')) {
          pre_parent.classList.add('coded-trigger');
        }
      }
      last_parent.classList.add('active');
    }
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  toggleGroup() {
    // If this group is already expanded, collapse it; otherwise, expand it
    const newGroupId = this.isExpanded ? null : this.item.id;
    this.navigationStateService.setExpandedGroup(newGroupId);
  }
}
