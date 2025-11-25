import { Component, ElementRef, inject, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as QRCode from 'qrcode';
import { environment } from 'src/app/environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { value: string },
    private messageService: MessageServiceService,
    public dialogRef: MatDialogRef<QrCodeComponent>
  ) {
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
      jobTitle: `${this.userData.jobTitle}`,
      email: this.userData.email,
      phone: this.userData.phoneNumber,
      employeeId: this.userData.employeeId || this.userData.memberNo
    };

    // Create attendance URL
    const dataParam = encodeURIComponent(JSON.stringify(employeeData));
    this.attendanceUrl = this.userData.memberNo ? `${environment.baseUrl}/memberService/mark-attendance/present/${this.userData.memberNo}`
                            : `${environment.baseUrl}/employeeService/mark-attendance/present/${this.userData.employeeId}`;

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

  simulateQRScan() { }

  // public downloadId(): void {
  //   const element = this.pdfContent.nativeElement;

  //   try {
  //     html2canvas(element).then((canvas) => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');

  //       const imgProps = pdf.getImageProperties(imgData);
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //       pdf.save(`${this.userData.employeeId ? this.userData.employeeId : this.userData.memberNo}.pdf`);

  //       this.closeDialog();

  //       // Show success message
  //       this.messageService.showSuccess('ID card downloaded successfully!');
  //     });
  //   } catch (error) {
  //     this.messageService.showError(error);
  //   }
  // }

  public async downloadId(): Promise<void> {
  const element = this.pdfContent.nativeElement;

  try {
    // Increase the scale for better quality (2 or 3 is usually enough)
    const canvas = await html2canvas(element, { scale: 3 });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST'); // or 'SLOW' for better quality
    pdf.save(`${this.userData.employeeId ? this.userData.employeeId : this.userData.memberNo}.pdf`);

    this.closeDialog();
    this.messageService.showSuccess('ID card downloaded successfully!');
  } catch (error) {
    this.messageService.showError('Error downloading ID card');
    console.error(error);
  }
}


  // Dialog close function
  closeDialog(): void {
    this.dialogRef.close();
  }
}
