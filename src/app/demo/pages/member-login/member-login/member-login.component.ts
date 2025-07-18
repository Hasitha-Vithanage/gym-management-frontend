import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import { MemberLoginServiceService } from 'src/app/services/member-login/member-login-service.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { TrainerLoginServiceService } from 'src/app/services/trainer-login/trainer-login-service.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { TrainerLoginDialogComponent } from '../../trainer-login-dialog/trainer-login-dialog.component';
import { MemberLoginDialogComponent } from '../../member-login-dialog/member-login-dialog.component';

@Component({
  selector: 'app-member-login',
  standalone: false,
  templateUrl: './member-login.component.html',
  styleUrl: './member-login.component.scss'
})

export class MemberLoginComponent {

displayedColumns: string[] = [
     'firstName',
     'lastName',
     'userName',
     'actions'
   ];
 
   dataSource: MatTableDataSource<any>;
   @ViewChild(MatPaginator) paginator: MatPaginator;
   @ViewChild(MatSort) sort: MatSort;
 
   /* calling constructor */
   constructor(
     private fb: FormBuilder,
    private memberLoginService: MemberLoginServiceService,
     private messageService: MessageServiceService,
     private http: HttpService,
     private notificationService: NotificationService,
     // private dialog: MatDialog
   ) {
   }
 
   // runs when load the page
   ngOnInit(): void {
     // get data request
     // calling populate data function
     this.populateData();
 
     
   }
 
   // implementation of populateData function
   public populateData(): void {
     try {
       this.memberLoginService.getData().subscribe({
         next: (dataList: any[]) => {
           if (dataList.length <= 0) {
             return;
           }
 
           this.dataSource = new MatTableDataSource(dataList);
 
           // sorting and pagination
           this.dataSource.paginator = this.paginator;
           this.dataSource.sort = this.sort;
         },
         // displaying error message
         error: (error) => {
           this.messageService.showError(error);
         }
       });
     } catch (error) {
       this.messageService.showError(error);
     }
   }
 
   // table filter function
   applyFilter(event: Event) {
     const filterValue = (event.target as HTMLInputElement).value;
     this.dataSource.filter = filterValue.trim().toLowerCase();
 
     // pagination code
     if (this.dataSource.paginator) {
       this.dataSource.paginator.firstPage();
     }
   }
 
 
   // Dialog Box
   readonly dialog = inject(MatDialog);
   openDialog(): void {
     const dialogRef = this.dialog.open(MemberLoginDialogComponent, {
       autoFocus: false,
     });
 
     dialogRef.afterClosed().subscribe((result) => {
       if (result?.action === 'add') {
         this.dataSource.data = [result.data, ...this.dataSource.data];
       }
     });
   }
 
 
   editData(data: any): void {
     const dialogRef = this.dialog.open(MemberLoginDialogComponent, {
       autoFocus: false,
     });
 
     dialogRef.afterOpened().subscribe(() => {
       dialogRef.componentInstance.onEdit(data);
     });
 
     dialogRef.afterClosed().subscribe((result) => {
       if (result?.action === 'edit') {
         const newData = this.dataSource.data.filter(item => item.id !== result.data.id);
         // Add the updated item to the top
         this.dataSource.data = [result.data, ...newData];
       }
     });
   }
 
   // // delete button function
   // public deleteData(data: any): void {
   //   const id = data.id;
   //   try {
   //     // calling deleteData function to send the delete request to the backend
   //     this.assignTrainerService.deleteData(id).subscribe({
   //       next: (respone: any) => {
   //         const index = this.dataSource.data.findIndex((element) => element.id === id);
 
   //         if (index != -1) {
   //           this.dataSource.data.splice(index, 1);
   //         }
   //         this.dataSource = new MatTableDataSource(this.dataSource.data);
 
   //         // displaying success message
   //         this.messageService.showSuccess('Record deleted successfully!');
   //       },
   //       // displaying error message
   //       error: (error) => {
   //         this.messageService.showError(error);
   //       }
   //     });
   //   } catch (error) {
   //     this.messageService.showError(error);
   //   }
   // }
 
   public deleteData(data: any): void {
       const dialogRef = this.dialog.open(ConfirmDialogComponent, {
         width: '350px',
         data: {
           message: `Are you sure you want to delete ${data.firstName} ${data.lastName}?`
         }
       });
   
       dialogRef.afterClosed().subscribe(result => {
         if (result) {
           const id = data.id;
           this.memberLoginService.deleteData(id).subscribe({
             next: () => {
               const index = this.dataSource.data.findIndex(item => item.id === id);
               if (index !== -1) {
                 this.dataSource.data.splice(index, 1);
               }
               this.dataSource = new MatTableDataSource(this.dataSource.data);
               this.messageService.showSuccess('Record deleted successfully!');
             },
             error: (error) => {
               this.messageService.showError(error);
             }
           });
         }
       });
     }
 
   //refresh button function
   public refreshData(): void {
     this.populateData();
   }
 
   public addNotification(details: any): void {
     this.notificationService.addNotification('Employee Added Successfully', 'success', 1);
   }
 
}
