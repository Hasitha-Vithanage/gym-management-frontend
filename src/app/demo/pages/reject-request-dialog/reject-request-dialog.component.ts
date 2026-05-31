import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reject-request-dialog',
  standalone: false,
  templateUrl: './reject-request-dialog.component.html',
  styleUrl: './reject-request-dialog.component.scss'
})
export class RejectRequestDialogComponent {

  reasonControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<RejectRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memberName: string; goal: string; level: string }
  ) {}

  onReject(): void {
    this.submitted = true;
    if (this.reasonControl.invalid) return;
    this.dialogRef.close(this.reasonControl.value);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
