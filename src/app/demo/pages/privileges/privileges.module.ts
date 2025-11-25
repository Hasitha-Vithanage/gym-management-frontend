import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemPrivilegesComponent } from './system-privileges/system-privileges.component';
import { RouterModule } from '@angular/router';
import { PrivilegesRoutes } from './privileges.routing';
import { PrivilegeGroupsComponent } from './privilege-groups/privilege-groups.component';
import { PrivilegeGroupsAddEditComponent } from './privilege-groups-add-edit/privilege-groups-add-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { CdkContextMenuTrigger, CdkMenuItem, CdkMenu } from '@angular/cdk/menu';
import { AddRemoveTableComponent } from '../add-remove-table/add-remove-table.component';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  declarations: [SystemPrivilegesComponent, PrivilegeGroupsComponent, PrivilegeGroupsAddEditComponent, AddRemoveTableComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(PrivilegesRoutes),
    ReactiveFormsModule,
    MatSortModule,
    CdkContextMenuTrigger,
    CdkMenuItem,
    CdkMenu,
    MaterialModule
  ]
})
export class PrivilegesModule {}
