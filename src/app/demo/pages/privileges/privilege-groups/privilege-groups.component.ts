import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PrivilegesService } from 'src/app/services/privileges/privileges.service';
import { PrivilegeGroupsAddEditComponent } from '../privilege-groups-add-edit/privilege-groups-add-edit.component';
import { AddRemoveTableComponent } from '../../add-remove-table/add-remove-table.component';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { AuthServiceService } from 'src/app/services/auth-service/auth-service.service';
import { authenticationEnum } from 'src/app/guards/auth.enum';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-privilege-groups',
  standalone: false,
  templateUrl: './privilege-groups.component.html',
  styleUrl: './privilege-groups.component.scss'
})
export class PrivilegeGroupsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'groupName', 'groupDescription', 'action'];
  dataSource!: MatTableDataSource<any>;

  dataList: any[] = [];
filteredData: any[] = [];
searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  rightPanelStyle: any = {};
  selectedRecord: any;
  selectedRowIndex = -1;
  display = false;

  constructor(
    private _dialog: MatDialog,
    private _privilegesService: PrivilegesService, // private _empService: EmployeeService, // private _coreService: CoreService
    private _messageService: MessageServiceService,
    private _authService: AuthServiceService
  ) { }

  ngOnInit(): void {
    try {
      this.checkAuthorization();
    } catch (error) {
      console.log(error);
    }
  }

  public checkAuthorization() {
    this.display = this._authService.checkAuthorization(authenticationEnum.Privilege_Groups);
    if (!this.display) {
      return;
    }
    this.getPrivilegeGroupList();
    this.closeContextMenu();
  }

public refreshData() {
  this.getPrivilegeGroupList();
  this.searchText = '';
}

public setPrivilegesGroupList(groupListDetails: any[]) {
  this.dataList = groupListDetails || [];
  this.filteredData = [...this.dataList];
}

  public openPrivilegeGroupAddEditClick(): void {
    try {
      const dialogRef = this._dialog.open(PrivilegeGroupsAddEditComponent);
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            if (val) {
              this.getPrivilegeGroupList();

              this._messageService.showSuccess('Privilege group added successfully!');
            }
          }
        }
      });
    } catch (error) {
      console.log(error);
      this._messageService.showError('Action Failed!');
    }
  }

  public onEditPrivilageGroupClick(data: any): void {
    const dialogRef = this._dialog.open(PrivilegeGroupsAddEditComponent, {
      data
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this._messageService.showSuccess('Privilege group edited successfully!');
          this.getPrivilegeGroupList();
        }
      }
    });
  }

  public onDeletePrivilageGroupClick(id: number, data: any): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Privilege Group',
        message: `Are you sure you want to delete "${data.groupName}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.performDelete(id, data);
      }
    });
  }

  private performDelete(id: number, data: any): void {
    try {
      this._privilegesService.deletePrivilegeGroup(id, data).then(() => {
        this._messageService.showSuccess('Privilege Group deleted successfully!');
        this.getPrivilegeGroupList();
      });
    } catch (error) {
      console.error(error);
      this._messageService.showError('Delete failed.');
    }
  }

  public handleCatch(): void {
    this.dataSource = new MatTableDataSource([{}]);
    this.dataSource.sort = null;
    this.dataSource.paginator = null;
  }

  getPrivilegeGroupList() {
    try {
      this._privilegesService.getPrivilegeGroupList().then((response: any) => {
        this.setPrivilegesGroupList(response);
      });
    } catch (error) {
      console.log(error);
    }
  }

applyFilter(event: Event) {
  const value = (event.target as HTMLInputElement).value.toLowerCase();
  this.searchText = value;

  this.filteredData = this.dataList.filter(x =>
    x.groupName?.toLowerCase().includes(value) ||
    x.groupDescription?.toLowerCase().includes(value) ||
    x.id?.toString().includes(value)
  );
}
  detectRightMouseClick($event: any, privilegeGroup: any) {
    this.selectedRowIndex = privilegeGroup.id;
    if ($event.which === 3) {
      this.rightPanelStyle = {
        display: 'block',
        position: 'absolute',
        'left.px': $event.clientX,
        'top.px': $event.clientY
      };
      this.selectedRecord = privilegeGroup;
    }
  }

  closeContextMenu() {
    this.rightPanelStyle = {
      display: 'none'
    };
  }
  onAddRemovePrivilegesClick() {
    try {
      const dialogRef = this._dialog.open(AddRemoveTableComponent, {
        height: '600px',
        width: '800px',
        data: {
          selectedItem: this.selectedRecord,
          assignedUrl: 'assigned-privileges',
          availableUrl: 'available-privileges',
          dataUrl: 'group-privileges'
        }
      });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.getPrivilegeGroupList();
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  onAddRemoveUsersClick() {
    try {
      const dialogRef = this._dialog.open(AddRemoveTableComponent, {
        height: '600px',
        width: '800px',
        data: {
          selectedItem: this.selectedRecord,
          assignedUrl: 'group-assigned-users',
          availableUrl: 'group-available-users',
          dataUrl: 'privilege-group-users'
        }
      });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.getPrivilegeGroupList();
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
