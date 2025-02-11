import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpService } from 'src/app/services/http.service';
import { CacheService } from 'src/app/services/CacheService';
import { CommonDataServiceService } from 'src/app/services/common-data-service/common-data-service.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/app/environments/environment';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-add-remove-table',
  standalone: false,
  templateUrl: './add-remove-table.component.html',
  styleUrl: './add-remove-table.component.scss'
})
export class AddRemoveTableComponent implements OnInit {
  sourceDisplayedColumns: string[] = ['sourceSelect', 'id', 'description'];
  targetDisplayedColumns: string[] = ['targetSelect', 'id', 'description'];
  sourceTableData = new MatTableDataSource<any>([]);
  sourceSelection = new SelectionModel<any>(true, []);
  targetTableData = new MatTableDataSource<any>([]);
  targetSelection = new SelectionModel<any>(true, []);
  oldAvailableData: any;
  oldAssignedData: any;
  isDisableButton = false;

  constructor(
    private httpService: HttpService,
    private cacheService: CacheService,
    private commonDataService: CommonDataServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    // table initialize
    this.commonDataService
      .getAvailablePrivilegeList('get', this.data.availableUrl, +this.data.selectedItem.id)
      .then((responseSource: any) => {
        this.sourceTableData.data = responseSource;
        this.sourceTableData.data = [...this.sourceTableData.data];
        this.commonDataService
          .getAssignedPrivilegeList('get', this.data.assignedUrl, +this.data.selectedItem.id)
          .then((responseTarget: any) => {
            this.targetTableData.data = responseTarget;
            this.targetTableData.data = [...this.targetTableData.data];

            this.oldAvailableData = this.sourceTableData.data;
            this.oldAssignedData = this.targetTableData.data;
          });
      });
  }

  isAllSourceSelected() {
    const numSelected = this.sourceSelection.selected.length;
    const numRows = this.sourceTableData.data.length;
    return numSelected === numRows;
  }

  isAllTargetSelected() {
    const numSelected = this.targetSelection.selected.length;
    const numRows = this.targetTableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear sourceSelection. */
  toggleAllSourceRows() {
    if (this.isAllSourceSelected()) {
      this.sourceSelection.clear();
      return;
    }

    this.sourceSelection.select(...this.sourceTableData.data);
  }

  toggleAllTargetRows() {
    if (this.isAllTargetSelected()) {
      this.targetSelection.clear();
      return;
    }
    this.targetSelection.select(...this.targetTableData.data);
  }

  /** The label for the checkbox on the passed row */
  sourceCheckboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSourceSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.sourceSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  targetCheckboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllTargetSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.targetSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onSourceTableDataSelect(row?: any) {
    console.log(row);
  }
  onTargetTableDataSelect(row?: any) {
    console.log(row);
  }

  moveFromSourceToTarget() {
    this.sourceSelection.selected.forEach((item) => {
      const inputElement = {
        id: item.id,
        description: item.description
      };

      this.targetTableData.data.push(inputElement);
      this.sourceTableData.data = this.sourceTableData.data.filter((removingItem) => removingItem.id != item.id);
      this.sourceSelection.deselect(item);
    });

    this.targetTableData.data = [...this.targetTableData.data];
  }
  // moveAllFromSourceToTarget() {}
  // moveAllFromTargetToSource() {}
  moveFromTargetToSource() {
    this.targetSelection.selected.forEach((item) => {
      const inputElement = {
        id: item.id,
        description: item.description
      };

      this.sourceTableData.data.push(inputElement);
      this.targetTableData.data = this.targetTableData.data.filter((removingItem) => removingItem.id != item.id);
      this.targetSelection.deselect(item);
    });

    this.sourceTableData.data = [...this.sourceTableData.data];
  }

  saveData() {
    const addedData = this.getAddedItems();
    const removedData = this.getRemovedItems();

    const privilegeGroupId = +this.data.selectedItem.id;

    const url = this.data.dataUrl + '/' + privilegeGroupId;

    const body = {
      removedData: removedData,
      addedData: addedData
    };

    this.commonDataService.saveData('post', url, body).then((response: any) => {
      this.cacheService.refreshCache(this.httpService.getUserId()!);
    });

    this.isDisableButton = true;
  }

  public getRemovedItems() {
    return this.oldAssignedData.filter((item: any) => !this.targetTableData.data.includes(item));
  }
  public getAddedItems() {
    return this.oldAvailableData.filter((item: any) => !this.sourceTableData.data.includes(item));
  }

  public resetData(): void {
    this.sourceTableData.data = this.oldAvailableData;
    this.sourceTableData.data = [...this.sourceTableData.data];
    this.sourceSelection.clear();
    this.targetTableData.data = this.oldAssignedData;
    this.targetTableData.data = [...this.targetTableData.data];
    this.targetSelection.clear();
  }

  public closeDialog() {}
}
