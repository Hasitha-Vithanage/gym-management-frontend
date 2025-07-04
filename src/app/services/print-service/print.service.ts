import { Injectable } from '@angular/core';
// import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor() {}

  /**
   * Print employee report
   * This method creates a print-optimized version of the employee report
   */
  printEmployeeReport(employees: any[]): void {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Member Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 5px;
          }
          .report-date {
            color: #6b7280;
            margin-bottom: 20px;
            font-size: 0.9rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            font-size: 0.8rem;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
          }
        </style>
      </head>
      <body>
        <h1>Member Report</h1>
        <div class="report-date">Generated on ${new Date().toLocaleDateString()}</div>

        <table>
          <thead>
            <tr>
              <th>Member ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>NIC</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Phone Number</th>
              <th>Emergency Contact</th>
            </tr>
          </thead>
          <tbody>
            ${employees
              .map(
                (emp) => `
              <tr>
                <td>${emp.employeeId || emp.memberNo}</td>
                <td>${emp.firstName} </td>
                <td>${emp.lastName}</td>
                <td>${emp.nic}</td>
                <td>${emp.gender}</td>
                <td>${emp.jobTitle || emp.dateOfBirth}</td>
                <td>${emp.phoneNumber}</td>
                <td>${emp.emergencyContactNumber}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Confidential - For internal use only</p>
          <p>Total Members: ${employees.length}</p>
        </div>
      </body>
      </html>
    `;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Write content to iframe and print
    iframe.contentWindow?.document.write(printContent);
    iframe.contentWindow?.document.close();

    // Wait for content to load before printing
    iframe.onload = () => {
      iframe.contentWindow?.print();
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  }
}
