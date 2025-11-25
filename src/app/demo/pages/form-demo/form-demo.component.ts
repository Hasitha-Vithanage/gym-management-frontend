import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { first } from 'rxjs';
import { FormDemoServiceService } from 'src/app/services/form-demo/form-demo-service.service';

/* Table */
const ELEMENT_DATA: any[] = [
  {firstName: 1, lastName: 'Hydrogen', age: 1.0079, email: 'H'}
];

@Component({
  selector: 'app-form-demo',
  standalone: false,
  templateUrl: './form-demo.component.html',
  styleUrl: './form-demo.component.scss'
})
export class FormDemoComponent implements OnInit{

  /*import form group, form builder, form control*/
  /*first_name, last_name, age, email*/

  demoForm: FormGroup;

  /* table */
  displayedColumns: string[] = ['firstName', 'lastName', 'age', 'email', 'actions'];
  dataSource: MatTableDataSource<any>;
  saveButtonLabel = "Save";
  currentMode = "Save";
  
  constructor(private fb: FormBuilder,
    private demoService: FormDemoServiceService) {
    this.demoForm = this.fb.group({
          firstName: new FormControl(''),
          lastName: new FormControl(''),
          age: new FormControl(''),
          email: new FormControl('')
        });
  }

  /* ngOnInit is runs on component initialization */
  ngOnInit(): void {
    // get data request
    this.populateData();
  }

  public populateData(): void {
    // implement get data code
    // ts --> service file function
    // service --> backend

    /* calling getData function in the service file and logging response from the backend */
    this.demoService.getData().subscribe((response:any[]) => {
      console.log("Get data response:", response);
      
      this.dataSource = new MatTableDataSource(response);
    });
  }
  
  /* save button function */
  onSubmit() {
    console.log("Form Submitted");
    console.log(this.demoForm.value);

    if(this.demoForm.invalid) {
      return;
    }

    const formData = this.demoForm.value;

    if(this.currentMode === "Save") {
      this.demoService.serviceCall(formData).subscribe((response) => {
        console.log("Data saved successfully:", response);
        this.resetForm();  
      });
    }
    else if (this.currentMode === "Edit"){
      // calling edit function
      this.demoService.editData(formData).subscribe((response) => {
        console.log("Data updated successfully:", response);
        this.resetForm();
      })
    }
  }

  /* edit button function */
  public editData(data: any): void {
    this.demoForm.patchValue(data);
    this.saveButtonLabel = "Edit";
    this.currentMode = "Edit";

    console.log(data.id);
    
  }

  /* delete button function */
  public deleteData(): void {

  }

  /* reset button function */
  public resetForm(): void {
    this.demoForm.reset();
    this.saveButtonLabel = "Save";
    this.currentMode = "Save";
  }
}
