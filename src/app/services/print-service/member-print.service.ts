import { Injectable } from '@angular/core';
// import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class MemberPrintService {
  constructor() { }

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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      background-color: #ffffff;
      color: #1f2937;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .logo {
      height: 60px;
    }

    .report-title {
      text-align: right;
    }

    .report-title h1 {
      margin: 0;
      font-size: 28px;
      color: #111827;
    }

    .report-date {
      font-size: 0.95rem;
      color: #6b7280;
      margin-top: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }

    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background-color: #f9fafb;
      font-weight: 600;
      font-size: 0.95rem;
      color: #374151;
    }

    tr:nth-child(even) {
      background-color: #f3f4f6;
    }

    tr:hover {
      background-color: #e5e7eb;
    }

    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 10px;
      font-size: 0.85rem;
      color: #6b7280;
      border-top: 1px solid #d1d5db;
    }

    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
      .header {
        justify-content: space-between;
      }
      .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="report-title">
      <h1>Member Report</h1>
      <div class="report-date">Generated on ${new Date().toLocaleDateString()}</div>
    </div>
  </div>

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
          <td>${emp.firstName}</td>
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
    <p>Confidential – For internal use only</p>
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
