import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EquipmentManagementService } from 'src/app/services/equipment-management/equipment-management.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-log-maintenance-dialog',
  standalone: false,
  templateUrl: './log-maintenance-dialog.component.html',
  styleUrls: ['./log-maintenance-dialog.component.scss']
})
export class LogMaintenanceDialogComponent implements OnInit {

  logForm: FormGroup;
  logs: any[] = [];
  isLoadingLogs = true;
  isSubmitting = false;
  submitted = false;

  readonly logTypes = ['ROUTINE', 'REPAIR', 'INSPECTION'];
  readonly today = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { equipment: any },
    private dialogRef: MatDialogRef<LogMaintenanceDialogComponent>,
    private fb: FormBuilder,
    private equipmentService: EquipmentManagementService,
    private messageService: MessageServiceService
  ) {}

  ngOnInit(): void {
    this.logForm = this.fb.group({
      type: ['ROUTINE', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]],
      performedBy: ['', Validators.required],
      performedDate: [new Date().toISOString().split('T')[0], Validators.required],
      cost: [null]
    });
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoadingLogs = true;
    this.equipmentService.getMaintenanceLogs(this.data.equipment.id).subscribe({
      next: (logs) => { this.logs = logs; this.isLoadingLogs = false; },
      error: () => { this.isLoadingLogs = false; }
    });
  }

  get equipmentName(): string {
    const e = this.data.equipment;
    return e.machineName || e.equipmentName || 'Equipment';
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'ROUTINE': return 'type-routine';
      case 'REPAIR': return 'type-repair';
      case 'INSPECTION': return 'type-inspection';
      default: return '';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.logForm.invalid) return;
    this.isSubmitting = true;

    const payload = { ...this.logForm.value };

    this.equipmentService.addMaintenanceLog(this.data.equipment.id, payload).subscribe({
      next: () => {
        // The endpoint returns the new log entry, not the equipment record — close with
        // the original equipment object so the table row keeps its correct field values.
        this.messageService.showSuccess('Maintenance log added');
        this.dialogRef.close(this.data.equipment);
      },
      error: (err) => {
        this.messageService.showError(err);
        this.isSubmitting = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
