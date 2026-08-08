import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-bar',
  templateUrl: './loading-bar.component.html',
  styleUrls: ['./loading-bar.component.scss']
})
export class LoadingBarComponent {
  visible = false;

  loadingBarStart() {
    this.visible = true;
  }

  loadingBarComplete() {
    this.visible = false;
  }
}
