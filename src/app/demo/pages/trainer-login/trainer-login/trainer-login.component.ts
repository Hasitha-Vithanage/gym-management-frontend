import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { on } from 'events';
import { AssignTrainerServiceService } from 'src/app/services/assign-trainer/assign-trainer-service.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { TrainerLoginServiceService } from 'src/app/services/trainer-login/trainer-login-service.service';
import { AssignTrainerDialogComponent } from '../../assign-trainer-dialog/assign-trainer-dialog.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { TrainerLoginDialogComponent } from '../../trainer-login-dialog/trainer-login-dialog.component';

@Component({
  selector: 'app-trainer-login',
  standalone: false,
  templateUrl: './trainer-login.component.html',
  styleUrl: './trainer-login.component.scss'
})
export class TrainerLoginComponent implements OnInit {

  displayedColumns: string[] = [
     'firstName',
     'lastName',
     'userName',
     'status',
     'actions'
   ];
 
   dataSource: MatTableDataSource<any>;
   @ViewChild(MatPaginator) paginator: MatPaginator;
   @ViewChild(MatSort) sort: MatSort;
 
   /* calling constructor */
   constructor(
     private fb: FormBuilder,
    private trainerLoginService: TrainerLoginServiceService,
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
    this.trainerLoginService.getData().subscribe({
      next: (dataList: any[]) => {
        this.dataSource = new MatTableDataSource(dataList || []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        this.messageService.showError(error);
        this.dataSource = new MatTableDataSource([]);
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
     const dialogRef = this.dialog.open(TrainerLoginDialogComponent, {
       autoFocus: false,
     });
 
     dialogRef.afterClosed().subscribe(() => this.populateData());
   }


   editData(data: any): void {
     const dialogRef = this.dialog.open(TrainerLoginDialogComponent, {
       autoFocus: false,
     });

     dialogRef.afterOpened().subscribe(() => {
       dialogRef.componentInstance.onEdit(data);
     });

     dialogRef.afterClosed().subscribe(() => this.populateData());
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
           message: `Are you sure you want to delete ${data.member}?`
         }
       });
   
       dialogRef.afterClosed().subscribe(result => {
         if (result) {
           const id = data.id;
           this.trainerLoginService.deleteData(id).subscribe({
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
 
   public toggleStatus(data: any): void {
    this.trainerLoginService.toggleStatus(data.id).subscribe({
      next: (response: any) => {
        const index = this.dataSource.data.findIndex(item => item.id === data.id);
        if (index !== -1) {
          this.dataSource.data[index].active = response.active;
          this.dataSource = new MatTableDataSource(this.dataSource.data);
        }
        this.messageService.showSuccess(response.active ? 'Login activated.' : 'Login deactivated.');
      },
      error: (error) => {
        this.messageService.showError(error);
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
