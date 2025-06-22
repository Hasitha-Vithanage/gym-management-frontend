import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NewSupplementServiceService } from 'src/app/services/new-supplement/new-supplement-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse-supplements',
  standalone: false,
  templateUrl: './browse-supplements.component.html',
  styleUrl: './browse-supplements.component.scss'
})
export class BrowseSupplementsComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private newSupplementService: NewSupplementServiceService,
    private router: Router
  ) { }

  dataSource = new MatTableDataSource<any>;

  // OnInit function
  ngOnInit(): void {
    this.populateData();
  }

  supplements: any[] = [];

  populateData(): void {
    this.newSupplementService.getData().subscribe((response: any[]) => {
      this.supplements = response.map(item => ({
        ...item,
        imageSrc: `data:${item.imageType};base64,${item.image}`,
        name: item.productName
      }));
      this.dataSource.data = this.supplements;
    });
  }

    viewDetails(supplement: any): void {
    // Navigate to the supplement details page with the selected supplement's ID
    console.log('Viewing supplement:', supplement);
    this.router.navigate(['/pages/supplement-details', supplement.id]);

  }

}
