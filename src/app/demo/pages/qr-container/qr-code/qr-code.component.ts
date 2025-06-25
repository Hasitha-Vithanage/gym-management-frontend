import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as QRCode from 'qrcode';
import { environment } from 'src/app/environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-qr-code',
  standalone: false,
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss'
})
export class QrCodeComponent {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

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
      employeeId: this.userData.employeeId
    };

    // Create attendance URL
    const dataParam = encodeURIComponent(JSON.stringify(employeeData));
    this.attendanceUrl = `${environment.baseUrl}/employeeService/mark-attendance/${this.userData.employeeId}`;

    try {
      await QRCode.toCanvas(canvas, this.attendanceUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  simulateQRScan() {}

  public downloadId(): void {
    const element = this.pdfContent.nativeElement;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${this.userData.employeeId}.pdf`);
    });
  }
}
