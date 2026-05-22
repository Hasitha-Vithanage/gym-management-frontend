import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { TrainerLoginServiceService } from 'src/app/services/trainer-login/trainer-login-service.service';

@Component({
  selector: 'app-trainer-login-dialog',
  standalone: false,
  templateUrl: './trainer-login-dialog.component.html',
  styleUrl: './trainer-login-dialog.component.scss'
})
export class TrainerLoginDialogComponent implements OnInit {
  trainerLoginForm: FormGroup;
  trainerList: any[] = [];
  dataSource: MatTableDataSource<any>;
  showPassword = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  registerButtonLabel = 'Register';
  mode = 'add';
  selectedData: any;
  isButtonDisabled = false;
  submitted = false;
  submitDisabled = false;
  isDisabled = false;

  constructor(
    private fb: FormBuilder,
    private trainerLoginService: TrainerLoginServiceService,
    public dialogRef: MatDialogRef<TrainerLoginDialogComponent>,
    private messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    this.trainerLoginForm = this.fb.group({
      trainerId: [null, Validators.required],
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      userName:  ['', Validators.required],
      password:  ['', Validators.required],
      role:      ['TRAINER'],
      userId:    [''],
      employee:  ['']
    });

    this.getTrainers();
    this.populateData();

    // Auto-fill first/last name when trainer is selected
    this.trainerLoginForm.get('trainerId')?.valueChanges.subscribe((selectedId) => {
      const selectedTrainer = this.trainerList.find((t) => t.id === selectedId);
      if (selectedTrainer) {
        this.trainerLoginForm.patchValue({
          firstName: selectedTrainer.firstName || '',
          lastName:  selectedTrainer.lastName  || '',
          employee:  selectedId
        });
      } else {
        this.trainerLoginForm.patchValue({ firstName: '', lastName: '' });
      }
    });
  }

  getTrainerName(id: number): string {
    const selected = this.trainerList.find((trainer) => trainer.id === id);
    return selected ? `${selected.firstName} ${selected.lastName}` : '';
  }

  public getTrainers(): void {
    this.trainerLoginService.getTrainers().subscribe({
      next: (response: any[]) => {
        this.trainerList = response;
      },
      error: (error) => {
        console.log('Error fetching trainers:', error);
      }
    });

    this.trainerLoginForm.get('firstName')?.disable();
    this.trainerLoginForm.get('lastName')?.disable();
  }

  public populateData(): void {
    this.trainerLoginService.getData().subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.messageService.showError('Error occurred while getting data!');
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.trainerLoginForm.invalid) {
      return;
    }

    try {
      if (this.mode === 'add') {
        this.trainerLoginService.serviceCall(this.trainerLoginForm.getRawValue()).subscribe({
          next: (response: any) => {
            this.dataSource = new MatTableDataSource(
              this.dataSource?.data?.length
                ? [response, ...this.dataSource.data]
                : [response]
            );
            this.messageService.showSuccess('Trainer registered successfully!');
          },
          error: (error) => {
            this.messageService.showError(error);
          }
        });
      } else if (this.mode === 'edit') {
        this.trainerLoginService
          .editData(this.selectedData?.id, this.trainerLoginForm.getRawValue())
          .subscribe({
            next: () => {
              this.messageService.showSuccess('Record updated successfully!');
            },
            error: (error) => {
              this.messageService.showError(error);
            }
          });
      }

      this.isDisabled = true;
      this.mode = 'add';
      this.populateData();
    } catch (error) {
      this.messageService.showError(error);
    }

    this.closeDialog();
  }

  onEdit(data: any): void {
    this.trainerLoginForm.patchValue({
      trainerId: data.id,
      firstName: data.firstName,
      lastName:  data.lastName,
      userName:  data.userName,
      password:  data.password,
      userId:    data.userId
    });
    this.registerButtonLabel = 'Update';
    this.mode = 'edit';
    this.selectedData = data;
    this.submitDisabled = true;

    this.trainerLoginForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.trainerLoginForm.valid || this.trainerLoginForm.pristine;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  togglePassword(): void {
  this.showPassword = !this.showPassword;
}
}