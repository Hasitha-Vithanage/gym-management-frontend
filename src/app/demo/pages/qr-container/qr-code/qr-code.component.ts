import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: false,
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss'
})
export class QrCodeComponent {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  isCardGenerated = false;
  isGenerating = false;
  attendanceUrl = '';
  userData = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { value: string }) {
    this.userData = this.data.value;
  }

  ngAfterViewInit(): void {
    this.isCardGenerated = true;
    this.generateCard();
  }

  public async generateCard() {
    this.isGenerating = true;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.isGenerating = false;

    // Generate QR code after the view is updated
    setTimeout(() => {
      this.generateQRCode();
    }, 100);
  }

  async generateQRCode() {
    const canvas = this.qrCanvas?.nativeElement;
    if (!canvas) return;
    const employeeData = {
      name: `${this.userData.firstName} ${this.userData.lastName}`,
      email: this.userData.email,
      phone: this.userData.phoneNumber,
      employeeId: this.userData.employeeId,
      verificationUrl: `${window.location.origin}/verify/${this.userData.employeeId}`
    };

    // Create attendance URL
    const dataParam = encodeURIComponent(JSON.stringify(employeeData));
    this.attendanceUrl = `${window.location.origin}/scan?data=${dataParam}`;

    try {
      await QRCode.toCanvas(canvas, this.attendanceUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });

      // Add click handler to QR code
      canvas.addEventListener('click', () => {
        this.simulateQRScan();
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  simulateQRScan() {
    const employeeData = {
      // name: `${this.userData.firstName} ${this.userData.lastName}`,
      // email: this.userData.email,
      // phone: this.userData.phone,
      // department: this.userData.department,
      // employeeId: this.userData.employeeId,
      // registrationDate: this.userData.registrationDate
    };

    const dataParam = encodeURIComponent(JSON.stringify(employeeData));
    // this.router.navigate(['/scan'], { queryParams: { data: dataParam } });
  }
}
