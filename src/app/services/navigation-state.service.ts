import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationStateService {
  private expandedGroupId = new BehaviorSubject<string | null>('home');
  public expandedGroupId$ = this.expandedGroupId.asObservable();

  constructor() { }

  /**
   * Set the expanded group ID
   * @param groupId - The ID of the group to expand, or null to collapse all
   */
  setExpandedGroup(groupId: string | null) {
    this.expandedGroupId.next(groupId);
  }

  /**
   * Get the current expanded group ID
   */
  getExpandedGroup(): string | null {
    return this.expandedGroupId.value;
  }
}
