import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Screenshots the given element and saves it as a paginated A4 PDF.
   * Works for any rendered content (tables, charts, mixed) since it
   * captures the actual DOM rather than reconstructing data into HTML.
   */
  async downloadElementAsPdf(element: HTMLElement, fileName: string, backgroundColor = '#0F1117'): Promise<void> {
    const canvas = await html2canvas(element, { scale: 2, backgroundColor });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const scaledHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = scaledHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  }
}
