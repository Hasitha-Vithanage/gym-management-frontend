import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpService } from 'src/app/services/http.service';
import { CacheService } from 'src/app/services/CacheService';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-system-privileges',
  standalone: false,
  templateUrl: './system-privileges.component.html',
  styleUrl: './system-privileges.component.scss',
})
export class SystemPrivilegesComponent implements OnInit {
  sourceDisplayedColumns: string[] = ['sourceSelect', 'id', 'description'];
  targetDisplayedColumns: string[] = ['targetSelect', 'id', 'description'];
  sourceTableData = new MatTableDataSource<any>([]);
  sourceSelection = new SelectionModel<any>(true, []);

  targetTableData = new MatTableDataSource<any>([]);
  targetSelection = new SelectionModel<any>(true, []);

  oldSourceTableData: any;
  oldTargetTableData: any;

  @ViewChild('sourcePaginator') sourcePaginator!: MatPaginator;
  @ViewChild('sourceSort') sourceSort!: MatSort;
  @ViewChild('targetPaginator') targetPaginator!: MatPaginator;
  @ViewChild('targeteSort') targeteSort!: MatSort;

  constructor(
    private httpService: HttpService,
    private cacheService: CacheService,
    private _messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    this.httpService.getSystemPrivileges().then((response: any) => {
      this.sourceTableData.data = response.sourcePrivileges;
      this.sourceTableData.data = [...this.sourceTableData.data];
      this.sourceTableData.sort = this.sourceSort;
      this.sourceTableData.paginator = this.sourcePaginator;

      this.targetTableData.data = response.targetPrivileges;
      this.targetTableData.data = [...this.targetTableData.data];
      this.targetTableData.sort = this.targeteSort;
      this.targetTableData.paginator = this.targetPaginator;

      this.oldSourceTableData = this.sourceTableData.data;
      this.oldTargetTableData = this.targetTableData.data;
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
    return `${
      this.sourceSelection.isSelected(row) ? 'deselect' : 'select'
    } row ${row.position + 1}`;
  }

  targetCheckboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllTargetSelected() ? 'deselect' : 'select'} all`;
    }
    return `${
      this.targetSelection.isSelected(row) ? 'deselect' : 'select'
    } row ${row.position + 1}`;
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
        description: item.description,
      };

      this.targetTableData.data.push(inputElement);
      this.sourceTableData.data = this.sourceTableData.data.filter(
        (removingItem) => removingItem.id != item.id
      );
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
        description: item.description,
      };

      this.sourceTableData.data.push(inputElement);
      this.targetTableData.data = this.targetTableData.data.filter(
        (removingItem) => removingItem.id != item.id
      );
      this.targetSelection.deselect(item);
    });

    this.sourceTableData.data = [...this.sourceTableData.data];
  }

  saveData() {
    try {
      this.httpService
        .saveSystemPrivileges({
          sourcePrivileges: this.sourceTableData.data,
          targetPrivileges: this.targetTableData.data,
        })
        .then((response) => {
          this._messageService.showSuccess(
            'System Privilege Changes Successfull!'
          );
        });
    } catch (error) {
      this._messageService.showError('Action Failed!');
    }
  }

  resetData() {
    this.sourceTableData.data = this.oldSourceTableData;
    this.sourceTableData.data = [...this.sourceTableData.data];
    this.sourceSelection.clear();
    this.targetTableData.data = this.oldTargetTableData;
    this.targetTableData.data = [...this.targetTableData.data];
    this.targetSelection.clear();
  }
}
