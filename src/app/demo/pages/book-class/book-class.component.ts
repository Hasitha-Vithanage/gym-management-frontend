import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AddClassService } from 'src/app/services/add-class/add-class.service';
import { BookClassService } from 'src/app/services/book-class/book-class.service';
import { HttpService } from 'src/app/services/http.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';

@Component({
  selector: 'app-book-class',
  standalone: false,
  templateUrl: './book-class.component.html',
  styleUrl: './book-class.component.scss'
})
export class BookClassComponent {

   @ViewChild(MatPaginator) paginator!: MatPaginator;
  
    constructor(
      private addClassService: AddClassService,
      private bookClassService: BookClassService,
      private router: Router,
          private http: HttpService,
              private messageService: MessageServiceService,
    ) { }
  
    dataSource = new MatTableDataSource<any>;
  
    // OnInit function
    ngOnInit(): void {
      this.populateData();
    }

      formatTime(data: any[]): string {
    try {
    // Split hours/minutes/seconds
    const time = data.join(':');
    const [hour, minute, second] = time.split(':').map(Number);

    // Create a Date in local time zone (no need to deal with UTC)
    const date = new Date();
    date.setHours(hour, minute, second || 0, 0);  // hour, minute, second, ms

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error('Time parse error:', e);
    return 'Invalid Time';
  }
  }
  
    classes: any[] = [];
  
    populateData(): void {
      this.addClassService.getData().subscribe((response: any[]) => {
        this.classes = response.map(item => ({
          ...item,
          // imageSrc: `data:${item.imageType};base64,${item.image}`,
          // name: item.productName
        }));
        this.dataSource.data = this.classes;
      });
    }

    bookClass(data: any) {
          // Prepare payload
    const payload = {
      ...data,
      username: this.http.getLoginNameFromCache()
    };
    console.log('Viewing supplement:', payload);
    this.router.navigate(['/pages/book-class-submit/', payload.id]);
    }
  
    //   viewDetails(supplement: any): void {
    //   // Navigate to the supplement details page with the selected supplement's ID
    //   console.log('Viewing supplement:', supplement);
    //   this.router.navigate(['/pages/supplement-details', supplement.id]);
  
    // }
}
